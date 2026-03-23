"""find_hotels tool — searches Booking.com for hotel options.

Strategy:
  - Firecrawl.search("best hotels {destination} site:booking.com") → top results
  - Firecrawl.scrape(top URL) → hotel details in markdown
  - Always return a generic Booking.com search URL as fallback

We avoid TripAdvisor and Airbnb due to strong anti-bot protection.
"""

import os
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


def _booking_search_url(destination: str, check_in: str, check_out: str) -> str:
    """Construct a Booking.com search URL. Dates are YYYY-MM-DD."""
    encoded = quote(destination)
    return (
        f"https://www.booking.com/searchresults.html"
        f"?ss={encoded}&checkin={check_in}&checkout={check_out}"
    )


def handle_find_hotels(destination: str, check_in: str, check_out: str) -> dict:
    cached = cache.get("find_hotels", destination)
    if cached:
        return cached

    fallback_url = _booking_search_url(destination, check_in, check_out)
    fallback = {
        "hotels": [
            {
                "name": f"Search Booking.com for hotels in {destination}",
                "booking_url": fallback_url,
                "highlight": "Click to see all available hotels with live pricing.",
            }
        ],
        "booking_search_url": fallback_url,
    }

    try:
        query = f"best hotels {destination} booking.com site:booking.com"
        raw = firecrawl.search(query, limit=3)
        web_results = _get_web_results(raw)

        hotels = []
        for item in web_results[:3]:
            url = _item_field(item, "url")
            hotels.append(
                {
                    "name": _item_field(item, "title", f"Hotel in {destination}"),
                    "highlight": _item_field(item, "description"),
                    "booking_url": url or fallback_url,
                }
            )

        # Scrape top result for richer detail (price, stars, location)
        detailed_info = ""
        if web_results:
            top_url = _item_field(web_results[0], "url")
            if top_url and "booking.com" in top_url:
                try:
                    scrape_raw = firecrawl.scrape(top_url, formats=["markdown"])
                    markdown = _get_markdown(scrape_raw)
                    detailed_info = markdown[:2000]
                except Exception:
                    pass

        response = {
            "hotels": hotels if hotels else fallback["hotels"],
            "detailed_info": detailed_info,
            "booking_search_url": fallback_url,
        }
        cache.set("find_hotels", destination, response)
        return response

    except Exception as e:
        fallback["error"] = str(e)
        fallback["fallback_message"] = (
            f"I had trouble finding live hotel results for {destination}. "
            "Here's a link to search Booking.com directly."
        )
        return fallback
