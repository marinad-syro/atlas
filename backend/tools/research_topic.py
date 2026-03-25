"""research_topic tool — scrapes a relevant page to answer "tell me more" requests.

Strategy:
  1. Firecrawl.search() to find the best article for the topic
  2. Firecrawl.scrape_url() to get the page's markdown
  3. Extract the first 2-3 meaningful paragraphs (skip headers, nav, short lines)
  4. Truncate to fit the EL data channel limit (~350 chars content)
  5. Return title, content, citation_url, citation_title
"""

import os
import re
from urllib.parse import quote
from firecrawl import Firecrawl
import cache

firecrawl = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])


def _get_web_results(result) -> list:
    if hasattr(result, "web") and result.web:
        return list(result.web)
    if isinstance(result, dict):
        return result.get("web") or []
    data = getattr(result, "data", None)
    if data:
        if hasattr(data, "web") and data.web:
            return list(data.web)
        if isinstance(data, dict):
            return data.get("web") or []
    return []


def _item_field(item, field: str, default: str = "") -> str:
    if hasattr(item, field):
        return getattr(item, field) or default
    if isinstance(item, dict):
        return item.get(field) or default
    return default


def _extract_paragraphs(markdown: str, max_chars: int = 350) -> str:
    """Pull first 2-3 substantive paragraphs from markdown, skip headers/nav."""
    lines = markdown.split("\n")
    paragraphs = []
    total = 0
    for line in lines:
        stripped = line.strip()
        # Skip headings, short lines, image/link-only lines, blank lines
        if (
            not stripped
            or stripped.startswith("#")
            or stripped.startswith("!")
            or len(stripped) < 60
            or re.match(r"^\[.*\]\(.*\)$", stripped)  # bare link line
        ):
            continue
        # Strip inline markdown (bold, italic, links) for clean text
        clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", stripped)
        clean = re.sub(r"[*_`]", "", clean)
        paragraphs.append(clean)
        total += len(clean)
        if total >= max_chars or len(paragraphs) >= 3:
            break

    text = " ".join(paragraphs)
    # Hard truncate with ellipsis if still over limit
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(" ", 1)[0] + "…"
    return text


def handle_research_topic(topic: str, destination: str) -> dict:
    cache_key = f"{topic}|{destination}"
    cached = cache.get("research_topic", cache_key)
    if cached:
        return cached

    error_fallback = {
        "title": f"{topic} in {destination}",
        "content": f"I couldn't find detailed information about {topic} in {destination} right now.",
        "citation_url": f"https://www.lonelyplanet.com/search?q={quote(destination)}",
        "citation_title": "Lonely Planet",
    }

    try:
        query = f"{topic} {destination} travel guide"
        raw = firecrawl.search(query, limit=3)
        results = _get_web_results(raw)
        if not results:
            return error_fallback

        top = results[0]
        top_url = _item_field(top, "url")
        top_title = _item_field(top, "title", topic)

        # Try scraping the top result for richer content
        content = ""
        try:
            scraped = firecrawl.scrape_url(top_url, formats=["markdown"])
            md = ""
            if hasattr(scraped, "markdown") and scraped.markdown:
                md = scraped.markdown
            elif isinstance(scraped, dict):
                md = scraped.get("markdown") or ""
            content = _extract_paragraphs(md)
        except Exception:
            pass

        # Fall back to search snippet if scrape failed or returned nothing useful
        if not content:
            snippet = _item_field(top, "description", "")
            content = snippet[:350] if snippet else f"No detailed content found for {topic} in {destination}."

        result = {
            "title": f"{topic} in {destination}"[:60],
            "content": content[:350],
            "citation_url": top_url[:80],
            "citation_title": top_title[:60],
        }
        cache.set("research_topic", cache_key, result)
        return result

    except Exception as e:
        error_fallback["error"] = str(e)
        return error_fallback
