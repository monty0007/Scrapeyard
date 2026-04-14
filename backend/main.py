"""
main.py — FastAPI backend for the Agent Hub.

Endpoints:
  GET  /api/agents                    List all agents + status
  GET  /api/agents/{name}/status      Single agent status
  POST /api/agents/{name}/run         Start a job
  POST /api/agents/{name}/stop        Kill a running job
  GET  /api/agents/{name}/logs        SSE stream of live logs
  POST /api/agents/{name}/install     Install the agent's dependencies
"""

import asyncio
import re
import subprocess
import sys
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
import runner

load_dotenv()

app = FastAPI(title="Agent Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:4173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Agent registry (mirrors frontend src/data/agents.js)
# ---------------------------------------------------------------------------
AGENT_REGISTRY: dict[str, dict] = {
    "bs4": {"name": "BeautifulSoup", "lang": "python", "pip": ["requests", "beautifulsoup4"]},
    "scrapy": {"name": "Scrapy", "lang": "python", "pip": ["scrapy"]},
    "requests-lxml": {"name": "Requests + lxml", "lang": "python", "pip": ["requests", "lxml"]},
    "crawl4ai": {"name": "Crawl4AI", "lang": "python", "pip": ["crawl4ai"]},
    "firecrawl": {"name": "Firecrawl", "lang": "python", "pip": ["requests"]},
    "selenium": {"name": "Selenium", "lang": "python", "pip": ["selenium"]},
    "chromium": {"name": "Chromium Headless", "lang": "python", "pip": []},
    "playwright": {"name": "Playwright", "lang": "python", "pip": ["playwright"], "post_install": ["playwright", "install", "chromium"]},
    "puppeteer": {"name": "Puppeteer", "lang": "javascript", "npm": ["puppeteer"]},
    "browserless": {"name": "Browserless", "lang": "python", "pip": ["requests"]},
    "n8n": {"name": "n8n", "lang": "python", "npm_global": ["n8n"]},
    "apify": {"name": "Apify", "lang": "python", "pip": ["apify-client"]},
    "scraperapi": {"name": "ScraperAPI", "lang": "python", "pip": ["requests"]},
    "scrapy-splash": {"name": "Scrapy-Splash", "lang": "python", "pip": ["scrapy", "scrapy-splash"]},
    "langchain": {"name": "LangChain Agent", "lang": "python", "pip": ["langchain", "openai"]},
    "autogen": {"name": "AutoGen", "lang": "python", "pip": ["pyautogen"]},
    "crewai": {"name": "CrewAI", "lang": "python", "pip": ["crewai"]},
    "firecrawl-agent": {"name": "Firecrawl /agent", "lang": "python", "pip": ["requests"]},
}

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
_SAFE_URL = re.compile(r'^https?://[^\s<>"\']+$')
_SAFE_SELECTOR = re.compile(r'^[\w\s.#\[\]=:>~*()\-,"\']*$')


class RunRequest(BaseModel):
    script: str
    config: dict[str, Any] = {}

    @field_validator("config")
    @classmethod
    def validate_config(cls, v: dict) -> dict:
        url = v.get("url", "")
        if url and not _SAFE_URL.match(url):
            raise ValueError("Invalid URL format")
        selector = v.get("selector", "")
        if selector and not _SAFE_SELECTOR.match(selector):
            raise ValueError("Selector contains disallowed characters")
        return v


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/agents")
def list_agents():
    return [
        {
            "id": aid,
            "name": meta["name"],
            "status": "running" if runner.is_running(aid) else "idle",
            "installed": _is_installed(aid, meta),
        }
        for aid, meta in AGENT_REGISTRY.items()
    ]


@app.get("/api/agents/{name}/status")
def agent_status(name: str):
    _require_known(name)
    return {
        "id": name,
        "status": "running" if runner.is_running(name) else "idle",
    }


@app.post("/api/agents/{name}/run")
def run_agent(name: str, body: RunRequest):
    _require_known(name)
    meta = AGENT_REGISTRY[name]
    try:
        runner.spawn(name, body.script, config=body.config, lang=meta["lang"])
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"status": "started"}


@app.post("/api/agents/{name}/stop")
def stop_agent(name: str):
    _require_known(name)
    runner.stop(name)
    return {"status": "stopped"}


@app.get("/api/agents/{name}/logs")
async def stream_logs(name: str):
    _require_known(name)

    async def event_generator():
        async for line in runner.stream_output(name):
            yield f"data: {line}\n\n"
        yield "data: [done]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/agents/{name}/install")
async def install_agent(name: str):
    _require_known(name)
    meta = AGENT_REGISTRY[name]
    output_lines: list[str] = []

    async def run_cmd(cmd: list[str]):
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        stdout, _ = await proc.communicate()
        output_lines.append(stdout.decode())
        if proc.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Command failed: {' '.join(cmd)}")

    if meta.get("pip"):
        await run_cmd([sys.executable, "-m", "pip", "install", *meta["pip"]])

    if meta.get("post_install"):
        await run_cmd([sys.executable, "-m", *meta["post_install"]])

    return {"status": "installed", "output": "\n".join(output_lines)}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _require_known(name: str):
    if name not in AGENT_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Unknown agent: {name}")


def _is_installed(agent_id: str, meta: dict) -> bool:
    """Quick heuristic check — tries to import the first pip package."""
    pip_pkgs = meta.get("pip", [])
    if not pip_pkgs:
        return True
    first = pip_pkgs[0].replace("-", "_").split("[")[0]
    result = subprocess.run(
        [sys.executable, "-c", f"import {first}"],
        capture_output=True,
    )
    return result.returncode == 0
