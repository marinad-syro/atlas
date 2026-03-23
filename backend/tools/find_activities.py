"""find_activities tool — scrapes top activities for a destination.

Strategy:
  - Firecrawl.search("things to do {destination} {preferences} hidden gems") → top results
  - Firecrawl.scrape(top URL) → activity details in markdown
  - Return top 3-5 activities with source links
"""

import os
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


def _get_markdown(result) -> str:
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


def handle_find_activities(destination: str, preferences: str = "") -> dict:
    cache_key = f"{destination}:{preferences}".lower().strip()
    cached = cache.get("find_activities", cache_key)
    if cached:
        return cached

    try:
        pref_clause = f"{preferences} " if preferences else ""
        query = (
            f"best things to do in {destination} {pref_clause}"
            "not touristy hidden gems travel guide"
        )
        raw = firecrawl.search(query, limit=3)
        web_results = _get_web_results(raw)

        activities = [
            {
                "name": _item_field(item, "title", f"Activity in {destination}"),
                "description": _item_field(item, "description"),
                "source_url": _item_field(item, "url"),
            }
            for item in web_results[:5]
        ]

        # Scrape top result for a richer list
        detailed_info = ""
        if web_results:
            top_url = _item_field(web_results[0], "url")
            if top_url:
                try:
                    scrape_raw = firecrawl.scrape(top_url, formats=["markdown"])
                    markdown = _get_markdown(scrape_raw)
                    detailed_info = markdown[:2000]
                except Exception:
                    pass

        response = {
            "activities": activities,
            "detailed_info": detailed_info,
        }
        cache.set("find_activities", cache_key, response)
        return response

    except Exception as e:
        return {
            "error": str(e),
            "fallback_message": (
                f"I couldn't retrieve activity info right now. "
                f"Popular activities in {destination} typically include local markets, "
                "historical sites, and outdoor adventures — I can describe some based on "
                "my knowledge if you'd like."
            ),
            "activities": [],
        }
