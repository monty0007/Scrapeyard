# Scrapeyard — Agent Hub

A web interface for running **18 scraping and AI agents** directly from the browser.  
Pick an agent, configure it through the UI, install its dependencies, then hit **Run** — logs stream back live.

---

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Agent Detail — Script Editor + Live Console
![Agent Detail](screenshots/agent-detail.png)

> **To add your own screenshots:** start the app (`uvicorn main:app --reload` + `npm run dev`), take a screenshot of each view, save them as `screenshots/dashboard.png` and `screenshots/agent-detail.png`, then commit them. They will render automatically on GitHub.

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend  | Python 3.11+ · FastAPI · uvicorn |
| Execution | subprocess per-agent, streamed via SSE |

---

## Quick Start

### 1 · Backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install server dependencies
pip install -r requirements.txt

# Copy and fill in API keys (optional — you can also set them in the UI)
cp .env.example .env

# Start the API server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### 2 · Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env (default points to localhost:8000)
cp .env.example .env

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Using an Agent

1. **Dashboard** — pick any agent card and click **Launch →**
2. **Config panel (left)** — set target URL, CSS selector, timeout, depth, or API key
3. **Install Deps** — click if the card shows "Not installed"; the server pip-installs the agent's packages live
4. **Script editor (centre)** — the template auto-uses your config via `CONFIG_URL`, `CONFIG_SELECTOR`, etc. — edit freely
5. **Run** — output streams into the console panel on the right in real time
6. **Stop** — terminates the process immediately

### CONFIG_* variables

The backend prepends these to every script before execution so your config panel values take effect:

| Variable | Source |
|---|---|
| `CONFIG_URL` | Target URL field |
| `CONFIG_SELECTOR` | CSS / XPath selector field |
| `CONFIG_HEADLESS` | Headless toggle |
| `CONFIG_TIMEOUT` | Timeout slider (seconds) |
| `CONFIG_DEPTH` | Crawl depth slider |
| `CONFIG_PROMPT` | Prompt textarea |
| `CONFIG_API_KEY` | ApiKey field _or_ `AGENT_API_KEY` env var |

---

## Agent Categories

| Category | Agents |
|---|---|
| **Scraping** | BeautifulSoup · Scrapy · Requests+lxml · Crawl4AI · Firecrawl |
| **Browser** | Selenium · Chromium · Playwright · Puppeteer · Browserless |
| **Automation** | n8n · Apify · ScraperAPI · Scrapy-Splash |
| **AI Agent** | LangChain · AutoGen · CrewAI · Firecrawl /agent |

---

## Environment Variables

Copy `backend/.env.example` → `backend/.env` and fill in the keys you plan to use.  
API keys can also be pasted directly into the **ApiKey** field in the UI (not stored persistently).

---

## Running in Production

```bash
# Backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (build then serve)
cd frontend && npm run build
# Serve dist/ with nginx, caddy, or:
npx serve dist -l 3000
```

Update `VITE_API_URL` in `frontend/.env` to your backend's public URL before building.

---

## Project Structure

```
Scrapeyard/
├── backend/
│   ├── main.py          # FastAPI app + agent registry
│   ├── runner.py        # subprocess management + config injection
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/agentApi.js      # fetch wrappers
│   │   ├── data/agents.js       # agent definitions + templates
│   │   ├── store/agentStore.js  # Zustand store
│   │   ├── pages/               # Dashboard + AgentDetail
│   │   └── components/          # AgentCard, ConfigPanel, ScriptEditor, OutputConsole …
│   └── .env.example
└── .gitignore
```
