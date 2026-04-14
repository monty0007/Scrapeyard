"""
runner.py — subprocess management for agent processes.

Each agent script is written to a temp file with CONFIG_* variables
injected at the top so templates can reference them directly.
"""
import asyncio
import json as _json
import os
import subprocess
import sys
import tempfile
from typing import AsyncIterator


# Map of agent_id -> running Popen process
_processes: dict[str, subprocess.Popen] = {}

# Map of agent_id -> temp script file path (cleaned up after process ends)
_tempfiles: dict[str, str] = {}


def is_running(agent_id: str) -> bool:
    proc = _processes.get(agent_id)
    return proc is not None and proc.poll() is None


def _inject_config(script: str, config: dict, lang: str) -> str:
    """Prepend CONFIG_* variables so templates can reference them directly."""
    url      = str(config.get("url", "https://example.com"))
    selector = str(config.get("selector", ""))
    headless = bool(config.get("headless", True))
    timeout  = int(config.get("timeout", 30))
    depth    = int(config.get("depth", 2))
    prompt   = str(config.get("prompt", ""))
    api_key  = str(config.get("apiKey", ""))

    if lang == "javascript":
        header = (
            "// --- AgentHub: injected config ---\n"
            f"const CONFIG_URL      = {_json.dumps(url)};\n"
            f"const CONFIG_SELECTOR = {_json.dumps(selector)};\n"
            f"const CONFIG_HEADLESS = {'true' if headless else 'false'};\n"
            f"const CONFIG_TIMEOUT  = {timeout};\n"
            f"const CONFIG_DEPTH    = {depth};\n"
            f"const CONFIG_PROMPT   = {_json.dumps(prompt)};\n"
            f"const CONFIG_API_KEY  = process.env.AGENT_API_KEY || {_json.dumps(api_key)};\n"
            "// --- End config ---\n\n"
        )
    else:
        header = (
            "# --- AgentHub: injected config ---\n"
            "import os as _os\n"
            f"CONFIG_URL      = {_json.dumps(url)}\n"
            f"CONFIG_SELECTOR = {_json.dumps(selector)}\n"
            f"CONFIG_HEADLESS = {repr(headless)}\n"
            f"CONFIG_TIMEOUT  = {timeout}\n"
            f"CONFIG_DEPTH    = {depth}\n"
            f"CONFIG_PROMPT   = {_json.dumps(prompt)}\n"
            f"CONFIG_API_KEY  = _os.environ.get('AGENT_API_KEY', {_json.dumps(api_key)})\n"
            "# --- End config ---\n\n"
        )
    return header + script


def spawn(agent_id: str, script: str, config: dict | None = None, lang: str = "python") -> subprocess.Popen:
    """Inject config, write to a temp file, and spawn the process."""
    if is_running(agent_id):
        raise RuntimeError(f"Agent '{agent_id}' is already running")

    full_script = _inject_config(script, config or {}, lang)

    suffix = ".js" if lang == "javascript" else ".py"
    tmp = tempfile.NamedTemporaryFile(
        mode="w", suffix=suffix, delete=False, encoding="utf-8"
    )
    try:
        tmp.write(full_script)
    finally:
        tmp.close()

    cmd = ["node", tmp.name] if lang == "javascript" else [sys.executable, tmp.name]

    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    _processes[agent_id] = proc
    _tempfiles[agent_id] = tmp.name
    return proc


def stop(agent_id: str) -> None:
    proc = _processes.get(agent_id)
    if proc and proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
    _processes.pop(agent_id, None)
    _cleanup_tempfile(agent_id)


def _cleanup_tempfile(agent_id: str) -> None:
    path = _tempfiles.pop(agent_id, None)
    if path and os.path.exists(path):
        try:
            os.unlink(path)
        except OSError:
            pass


async def stream_output(agent_id: str) -> AsyncIterator[str]:
    """Async generator that yields stdout lines from the running process."""
    proc = _processes.get(agent_id)
    if not proc or not proc.stdout:
        return

    loop = asyncio.get_event_loop()
    try:
        while True:
            line = await loop.run_in_executor(None, proc.stdout.readline)
            if not line:
                break
            yield line.rstrip("\n")
    finally:
        _cleanup_tempfile(agent_id)

