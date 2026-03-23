"""suggest_destination tool — searches for travel destinations matching user preferences.

Flow:
  1. Firecrawl.search() → top 3 web results (title + snippet)
  2. Firecrawl.scrape(top URL) → detailed markdown (first 2000 chars)
  3. Return combined data to the ElevenLabs agent for narration
"""

import os
from firecrawl import Firecrawl
import cache

firecrawl = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])


def _get_web_results(result) -> list:
    """Extract the web results list from a Firecrawl search response.

    The Python SDK returns the data object directly, so the result
    should have a .web attribute. We also handle the dict case defensively.
    """
    if hasattr(result, "web") and result.web:
        return list(result.web)
    if isinstance(result, dict):
        return result.get("web") or []
    # Fallback: SDK may wrap in .data
    data = getattr(result, "data", None)
    if data:
        if hasattr(data, "web") and data.web:
            return list(data.web)
        if isinstance(data, dict):
            return data.get("web") or []
    return []


def _get_markdown(result) -> str:
    """Extract markdown string from a Firecrawl scrape response."""
    if hasattr(result, "markdown") and result.markdown:
        return result.markdown
    if isinstance(result, dict):
        return result.get("markdown") or ""
    data = getattr(result, "data", None)
    if data:
        if hasattr(data, "markdown") and data.markdown:
            return data.markdown
        if isinstance(data, dict):
            return data.get("markdown") or ""
    return ""


def _item_field(item, field: str, default: str = "") -> str:
    if hasattr(item, field):
        return getattr(item, field) or default
    if isinstance(item, dict):
        return item.get(field) or default
    return default


def handle_suggest_destination(preferences: str) -> dict:
    cached = cache.get("suggest_destination", preferences)
    if cached:
        return cached

    try:
        query = f"best travel destinations {preferences} travel guide review"
        raw = firecrawl.search(query, limit=3)
        web_results = _get_web_results(raw)

        destinations = [
            {
                "name": _item_field(item, "title", "Unknown destination"),
                "summary": _item_field(item, "description", "No description available."),
                "source_url": _item_field(item, "url"),
            }
            for item in web_results[:3]
        ]

        # Scrape the top result for richer context
        detailed_info = ""
        if web_results:
            top_url = _item_field(web_results[0], "url")
            if top_url:
                try:
                    scrape_raw = firecrawl.scrape(top_url, formats=["markdown"])
                    markdown = _get_markdown(scrape_raw)
                    detailed_info = markdown[:2000]
                except Exception:
                    pass  # Scrape failure is non-fatal; search results are enough

        response = {
            "destinations": destinations,
            "detailed_info": detailed_info,
        }
        cache.set("suggest_destination", preferences, response)
        return response

    except Exception as e:
        return {
            "error": str(e),
            "fallback_message": (
                "I couldn't find specific destinations right now — "
                "let me suggest based on my knowledge instead."
            ),
            "destinations": [],
        }
