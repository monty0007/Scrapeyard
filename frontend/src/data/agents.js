export const CATEGORIES = {
  SCRAPING: 'Scraping',
  BROWSER: 'Browser',
  AUTOMATION: 'Automation',
  AI_AGENT: 'AI Agent',
};

export const AGENTS = [
  {
    id: 'bs4',
    name: 'BeautifulSoup',
    shortName: 'BS4',
    description: 'HTML/XML parser for static pages. Fast, simple, widely used.',
    category: CATEGORIES.SCRAPING,
    language: 'Python',
    icon: '🕷',
    template: `import requests
from bs4 import BeautifulSoup

response = requests.get(CONFIG_URL, timeout=CONFIG_TIMEOUT)
response.raise_for_status()
soup = BeautifulSoup(response.text, "html.parser")

if CONFIG_SELECTOR:
    for el in soup.select(CONFIG_SELECTOR):
        print(el.get_text(strip=True))
else:
    for a in soup.find_all("a", href=True):
        print(a["href"], "-", a.get_text(strip=True))`,
    templateLang: 'python',
    configFields: ['url', 'selector', 'timeout'],
  },
  {
    id: 'scrapy',
    name: 'Scrapy',
    shortName: 'Scrapy',
    description: 'Full-featured async crawling framework. Best for large-scale structured scraping.',
    category: CATEGORIES.SCRAPING,
    language: 'Python',
    icon: '🕸',
    template: `import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.utils.log import configure_logging

configure_logging()

class MySpider(scrapy.Spider):
    name = "my_spider"
    start_urls = [CONFIG_URL]
    custom_settings = {"DEPTH_LIMIT": CONFIG_DEPTH, "LOG_LEVEL": "WARNING"}

    def parse(self, response):
        selector = (CONFIG_SELECTOR + "::text") if CONFIG_SELECTOR else "a::attr(href)"
        for value in response.css(selector).getall():
            print(value)

process = CrawlerProcess(settings={"LOG_LEVEL": "WARNING"})
process.crawl(MySpider)
process.start()`,
    templateLang: 'python',
    configFields: ['url', 'selector', 'depth'],
  },
  {
    id: 'requests-lxml',
    name: 'Requests + lxml',
    shortName: 'lxml',
    description: 'Lightweight HTTP + fast XML/HTML parser combo. Great for simple structured sites.',
    category: CATEGORIES.SCRAPING,
    language: 'Python',
    icon: '📄',
    template: `import requests
from lxml import html

response = requests.get(CONFIG_URL, timeout=CONFIG_TIMEOUT)
response.raise_for_status()
tree = html.fromstring(response.content)

if CONFIG_SELECTOR:
    for el in tree.cssselect(CONFIG_SELECTOR):
        print(el.text_content().strip())
else:
    for link in tree.cssselect("a"):
        href = link.get("href")
        if href:
            print(href, "-", (link.text_content() or "").strip())`,
    templateLang: 'python',
    configFields: ['url', 'selector', 'timeout'],
  },
  {
    id: 'crawl4ai',
    name: 'Crawl4AI',
    shortName: 'Crawl4AI',
    description: 'Open-source AI-powered scraper. Outputs LLM-ready markdown.',
    category: CATEGORIES.SCRAPING,
    language: 'Python',
    icon: '🤖',
    template: `from crawl4ai import AsyncWebCrawler
import asyncio

async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=CONFIG_URL)
        print(result.markdown[:5000] if result.markdown else "[warn] No content extracted")

asyncio.run(main())`,
    templateLang: 'python',
    configFields: ['url', 'depth'],
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    shortName: 'Firecrawl',
    description: 'API-first scraper with JS rendering, anti-bot bypass, and /agent for autonomous research.',
    category: CATEGORIES.SCRAPING,
    language: 'Python',
    icon: '🔥',
    template: `import requests

if not CONFIG_API_KEY:
    print("[error] Set your Firecrawl API key in the ApiKey field or via AGENT_API_KEY env var")
else:
    response = requests.post(
        "https://api.firecrawl.dev/v1/scrape",
        headers={"Authorization": f"Bearer {CONFIG_API_KEY}"},
        json={"url": CONFIG_URL, "formats": ["markdown"]},
        timeout=CONFIG_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    print(data.get("data", {}).get("markdown", data))`,
    templateLang: 'python',
    configFields: ['url', 'apiKey'],
    requiresApiKey: true,
  },
  {
    id: 'selenium',
    name: 'Selenium',
    shortName: 'Selenium',
    description: 'Most widely used browser automation library. Supports Chrome, Firefox, Edge via WebDriver.',
    category: CATEGORIES.BROWSER,
    language: 'Python',
    icon: '🌐',
    template: `from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

options = Options()
if CONFIG_HEADLESS:
    options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options)
driver.set_page_load_timeout(CONFIG_TIMEOUT)
try:
    driver.get(CONFIG_URL)
    print("Title:", driver.title)
    if CONFIG_SELECTOR:
        for el in driver.find_elements(By.CSS_SELECTOR, CONFIG_SELECTOR)[:20]:
            print(el.text.strip())
    else:
        for link in driver.find_elements(By.TAG_NAME, "a")[:20]:
            print(link.get_attribute("href"), "-", link.text.strip())
finally:
    driver.quit()`,
    templateLang: 'python',
    configFields: ['url', 'selector', 'headless', 'timeout'],
  },
  {
    id: 'chromium',
    name: 'Chromium Headless',
    shortName: 'Chromium',
    description: 'Raw headless browser for rendering JS-heavy pages.',
    category: CATEGORIES.BROWSER,
    language: 'Any',
    icon: '🔵',
    template: `import subprocess, shutil

binary = (
    shutil.which("chromium") or
    shutil.which("chromium-browser") or
    shutil.which("google-chrome")
)
if not binary:
    print("[error] chromium / google-chrome not found in PATH")
else:
    args = [binary, "--headless", "--disable-gpu", "--no-sandbox", "--dump-dom", CONFIG_URL]
    result = subprocess.run(args, capture_output=True, text=True, timeout=CONFIG_TIMEOUT)
    print((result.stdout or result.stderr)[:3000])`,
    templateLang: 'python',
    configFields: ['url', 'headless'],
  },
  {
    id: 'playwright',
    name: 'Playwright',
    shortName: 'Playwright',
    description: 'Cross-browser automation (Chromium, Firefox, WebKit). Faster and more modern than Selenium.',
    category: CATEGORIES.BROWSER,
    language: 'Python',
    icon: '🎭',
    template: `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=CONFIG_HEADLESS)
    page = browser.new_page()
    page.set_default_timeout(CONFIG_TIMEOUT * 1000)
    page.goto(CONFIG_URL)
    print("Title:", page.title())
    if CONFIG_SELECTOR:
        for el in page.query_selector_all(CONFIG_SELECTOR)[:20]:
            print(el.text_content().strip())
    else:
        for link in page.query_selector_all("a")[:20]:
            href = link.get_attribute("href") or ""
            text = (link.text_content() or "").strip()
            if href:
                print(f"{text} -> {href}")
    browser.close()`,
    templateLang: 'python',
    configFields: ['url', 'selector', 'headless', 'timeout'],
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    shortName: 'Puppeteer',
    description: 'Node.js headless Chrome library by Google. Great for screenshots, PDFs, JS-heavy scraping.',
    category: CATEGORIES.BROWSER,
    language: 'JavaScript',
    icon: '🎪',
    template: `const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: CONFIG_HEADLESS });
  const page = await browser.newPage();
  page.setDefaultTimeout(CONFIG_TIMEOUT * 1000);
  await page.goto(CONFIG_URL, { waitUntil: "networkidle2" });
  console.log("Title:", await page.title());
  if (CONFIG_SELECTOR) {
    const texts = await page.$$eval(CONFIG_SELECTOR, els =>
      els.slice(0, 20).map(el => el.textContent.trim()));
    texts.forEach(t => console.log(t));
  } else {
    const links = await page.$$eval("a", els =>
      els.slice(0, 20).map(a => ({ href: a.href, text: a.textContent.trim() })));
    links.forEach(l => console.log(l.text, "->", l.href));
  }
  await browser.close();
})();`,
    templateLang: 'javascript',
    configFields: ['url', 'selector', 'headless', 'timeout'],
  },
  {
    id: 'browserless',
    name: 'Browserless',
    shortName: 'Browserless',
    description: 'Cloud-hosted headless browser platform with stealth + CAPTCHA support.',
    category: CATEGORIES.BROWSER,
    language: 'API',
    icon: '☁️',
    template: `import requests

if not CONFIG_API_KEY:
    print("[error] Set your Browserless API key in the ApiKey field or via AGENT_API_KEY env var")
else:
    response = requests.post(
        "https://chrome.browserless.io/content",
        params={"token": CONFIG_API_KEY},
        json={"url": CONFIG_URL},
        timeout=CONFIG_TIMEOUT,
    )
    response.raise_for_status()
    print(response.text[:3000])`,
    templateLang: 'python',
    configFields: ['url', 'apiKey'],
    requiresApiKey: true,
  },
  {
    id: 'n8n',
    name: 'n8n',
    shortName: 'n8n',
    description: 'Open-source workflow automation with 400+ integrations. Self-hostable.',
    category: CATEGORIES.AUTOMATION,
    language: 'No-code',
    icon: '⚡',
    template: `import subprocess, shutil, sys

print("Target URL to automate:", CONFIG_URL)
print()
if shutil.which("n8n"):
    print("[info] n8n found. To start: n8n start")
    print("[info] Dashboard: http://localhost:5678")
elif shutil.which("npx"):
    print("[info] Starting n8n via npx (may take a moment on first run)...")
    result = subprocess.run(
        ["npx", "--yes", "n8n", "start"],
        capture_output=True, text=True, timeout=30
    )
    print(result.stdout or result.stderr)
else:
    print("[error] Node.js/npx not found. Install from https://nodejs.org")
    print("[info]  Or run with Docker: docker run -p 5678:5678 n8nio/n8n")`,
    templateLang: 'python',
    configFields: ['url'],
  },
  {
    id: 'apify',
    name: 'Apify',
    shortName: 'Apify',
    description: 'Actor-based cloud scraping platform with 1,200+ pre-built scrapers.',
    category: CATEGORIES.AUTOMATION,
    language: 'JS / Python',
    icon: '🏭',
    template: `from apify_client import ApifyClient

if not CONFIG_API_KEY:
    print("[error] Set your Apify API token in the ApiKey field or via AGENT_API_KEY env var")
else:
    client = ApifyClient(CONFIG_API_KEY)
    run = client.actor("apify/web-scraper").call(run_input={
        "startUrls": [{"url": CONFIG_URL}],
        "maxCrawlDepth": CONFIG_DEPTH,
    })
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        print(item)`,
    templateLang: 'python',
    configFields: ['url', 'apiKey', 'depth'],
    requiresApiKey: true,
  },
  {
    id: 'scraperapi',
    name: 'ScraperAPI',
    shortName: 'ScraperAPI',
    description: 'Proxy + CAPTCHA management API. Wraps any scraper with IP rotation and throttling.',
    category: CATEGORIES.AUTOMATION,
    language: 'API',
    icon: '🔄',
    template: `import requests

if not CONFIG_API_KEY:
    print("[error] Set your ScraperAPI key in the ApiKey field or via AGENT_API_KEY env var")
else:
    response = requests.get(
        "http://api.scraperapi.com",
        params={"api_key": CONFIG_API_KEY, "url": CONFIG_URL},
        timeout=CONFIG_TIMEOUT,
    )
    response.raise_for_status()
    print(response.text[:3000])`,
    templateLang: 'python',
    configFields: ['url', 'apiKey'],
    requiresApiKey: true,
  },
  {
    id: 'scrapy-splash',
    name: 'Scrapy-Splash',
    shortName: 'Splash',
    description: 'Scrapy + Splash headless browser integration for JS rendering within Scrapy pipelines.',
    category: CATEGORIES.AUTOMATION,
    language: 'Python',
    icon: '💦',
    template: `import scrapy
from scrapy_splash import SplashRequest
from scrapy.crawler import CrawlerProcess

class MySpider(scrapy.Spider):
    name = "splash_spider"

    def start_requests(self):
        yield SplashRequest(
            CONFIG_URL, self.parse,
            args={"wait": 1.0, "timeout": CONFIG_TIMEOUT}
        )

    def parse(self, response):
        if CONFIG_SELECTOR:
            for text in response.css(CONFIG_SELECTOR + "::text").getall()[:20]:
                print(text.strip())
        else:
            print("Title:", response.css("title::text").get())
            print("Links found:", len(response.css("a")))

process = CrawlerProcess(settings={
    "SPLASH_URL": "http://localhost:8050",
    "DOWNLOADER_MIDDLEWARES": {
        "scrapy_splash.SplashCookiesMiddleware": 723,
        "scrapy_splash.SplashMiddleware": 725,
        "scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware": 810,
    },
    "SPIDER_MIDDLEWARES": {"scrapy_splash.SplashDeduplicateArgsMiddleware": 100},
    "DUPEFILTER_CLASS": "scrapy_splash.SplashAwareDupeFilter",
    "LOG_LEVEL": "WARNING",
})
process.crawl(MySpider)
process.start()`,
    templateLang: 'python',
    configFields: ['url', 'selector', 'timeout'],
  },
  {
    id: 'langchain',
    name: 'LangChain Agent',
    shortName: 'LangChain',
    description: 'LLM-powered agent for multi-step reasoning and tool chaining.',
    category: CATEGORIES.AI_AGENT,
    language: 'Python',
    icon: '🦜',
    template: `import os

if not CONFIG_API_KEY:
    print("[error] Set your OpenAI API key in the ApiKey field or via AGENT_API_KEY env var")
else:
    os.environ["OPENAI_API_KEY"] = CONFIG_API_KEY
    from langchain_openai import ChatOpenAI
    from langchain.agents import initialize_agent, AgentType
    from langchain_community.tools import DuckDuckGoSearchRun

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    tools = [DuckDuckGoSearchRun()]
    agent = initialize_agent(
        tools, llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    prompt = CONFIG_PROMPT or f"Summarize the key content at {CONFIG_URL}"
    result = agent.run(prompt)
    print(result)`,
    templateLang: 'python',
    configFields: ['url', 'prompt', 'apiKey'],
  },
  {
    id: 'autogen',
    name: 'AutoGen',
    shortName: 'AutoGen',
    description: "Microsoft's multi-agent conversation framework for complex tasks.",
    category: CATEGORIES.AI_AGENT,
    language: 'Python',
    icon: '🤝',
    template: `import autogen

if not CONFIG_API_KEY:
    print("[error] Set your OpenAI API key in the ApiKey field or via AGENT_API_KEY env var")
else:
    config = {"model": "gpt-4o-mini", "api_key": CONFIG_API_KEY}
    assistant = autogen.AssistantAgent(
        "assistant",
        llm_config={"config_list": [config]},
    )
    user = autogen.UserProxyAgent(
        "user",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=3,
    )
    message = CONFIG_PROMPT or f"Scrape and summarize {CONFIG_URL}"
    user.initiate_chat(assistant, message=message)`,
    templateLang: 'python',
    configFields: ['url', 'prompt', 'apiKey'],
  },
  {
    id: 'crewai',
    name: 'CrewAI',
    shortName: 'CrewAI',
    description: 'Role-based multi-agent framework. Agents are assigned personas and tasks.',
    category: CATEGORIES.AI_AGENT,
    language: 'Python',
    icon: '👥',
    template: `import os
from crewai import Agent, Task, Crew

if not CONFIG_API_KEY:
    print("[error] Set your OpenAI API key in the ApiKey field or via AGENT_API_KEY env var")
else:
    os.environ["OPENAI_API_KEY"] = CONFIG_API_KEY
    researcher = Agent(
        role="Researcher",
        goal="Extract and summarize key information from the web",
        backstory="Expert web researcher with strong analytical skills",
        verbose=True,
    )
    description = CONFIG_PROMPT or f"Scrape and summarize the content at {CONFIG_URL}"
    task = Task(
        description=description,
        expected_output="A concise structured summary of the main content",
        agent=researcher,
    )
    crew = Crew(agents=[researcher], tasks=[task], verbose=True)
    result = crew.kickoff()
    print(result)`,
    templateLang: 'python',
    configFields: ['url', 'prompt', 'apiKey'],
  },
  {
    id: 'firecrawl-agent',
    name: 'Firecrawl /agent',
    shortName: 'FC Agent',
    description: 'Autonomous research endpoint — give a prompt, it browses multiple sources.',
    category: CATEGORIES.AI_AGENT,
    language: 'API',
    icon: '🔥',
    template: `import requests

if not CONFIG_API_KEY:
    print("[error] Set your Firecrawl API key in the ApiKey field or via AGENT_API_KEY env var")
else:
    prompt = CONFIG_PROMPT or f"Research and summarize the content at {CONFIG_URL}"
    response = requests.post(
        "https://api.firecrawl.dev/v1/agent",
        headers={"Authorization": f"Bearer {CONFIG_API_KEY}"},
        json={"prompt": prompt, "maxDepth": CONFIG_DEPTH},
        timeout=120,
    )
    response.raise_for_status()
    print(response.json())`,
    templateLang: 'python',
    configFields: ['url', 'prompt', 'apiKey', 'depth'],
    requiresApiKey: true,
  },
];

export const CATEGORY_COLORS = {
  [CATEGORIES.SCRAPING]: {
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    dot: 'bg-blue-400',
  },
  [CATEGORIES.BROWSER]: {
    badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    dot: 'bg-purple-400',
  },
  [CATEGORIES.AUTOMATION]: {
    badge: 'bg-green-500/20 text-green-400 border border-green-500/30',
    dot: 'bg-green-400',
  },
  [CATEGORIES.AI_AGENT]: {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-400',
  },
};
