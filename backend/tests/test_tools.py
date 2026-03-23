"""Unit tests for all 4 backend tool handlers.

Uses unittest.mock to patch the Firecrawl client so no real API calls are made.
Run from backend/:  pytest tests/
"""

import sys
import os
import pytest
from unittest.mock import patch, MagicMock

# Ensure backend/ is on the path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Set a dummy env var before tools are imported
os.environ.setdefault("FIRECRAWL_API_KEY", "fc-test-key")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _mock_web_item(url: str, title: str, description: str) -> MagicMock:
    item = MagicMock()
    item.url = url
    item.title = title
    item.description = description
    return item


def _mock_search_result(items: list) -> MagicMock:
    result = MagicMock()
    result.web = items
    return result


def _mock_scrape_result(markdown: str) -> MagicMock:
    result = MagicMock()
    result.markdown = markdown
    return result


# ─── suggest_destination ──────────────────────────────────────────────────────

class TestSuggestDestination:
    def test_returns_destinations_from_search(self):
        items = [
            _mock_web_item("https://example.com/sardinia", "Sardinia Travel Guide", "Beautiful beaches"),
            _mock_web_item("https://example.com/mallorca", "Mallorca Guide", "Great nightlife"),
        ]
        with patch("tools.suggest_destination.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result(items)
            mock_fc.scrape.return_value = _mock_scrape_result("# Sardinia\nAmazing island.")

            from tools.suggest_destination import handle_suggest_destination
            import cache; cache._cache.clear()

            result = handle_suggest_destination("warm beach europe quiet")

        assert "destinations" in result
        assert len(result["destinations"]) == 2
        assert result["destinations"][0]["name"] == "Sardinia Travel Guide"
        assert result["destinations"][0]["source_url"] == "https://example.com/sardinia"

    def test_returns_detailed_info_from_scrape(self):
        items = [_mock_web_item("https://example.com/sardinia", "Sardinia", "Nice")]
        with patch("tools.suggest_destination.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result(items)
            mock_fc.scrape.return_value = _mock_scrape_result("# Sardinia\nDetails here.")

            from tools.suggest_destination import handle_suggest_destination
            import cache; cache._cache.clear()

            result = handle_suggest_destination("beach europe")

        assert "detailed_info" in result
        assert "Sardinia" in result["detailed_info"]

    def test_returns_fallback_on_firecrawl_error(self):
        with patch("tools.suggest_destination.firecrawl") as mock_fc:
            mock_fc.search.side_effect = Exception("API error")

            from tools.suggest_destination import handle_suggest_destination
            import cache; cache._cache.clear()

            result = handle_suggest_destination("mountains")

        assert "error" in result
        assert "fallback_message" in result
        assert result["destinations"] == []

    def test_scrape_failure_is_non_fatal(self):
        items = [_mock_web_item("https://example.com", "Guide", "Nice")]
        with patch("tools.suggest_destination.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result(items)
            mock_fc.scrape.side_effect = Exception("scrape failed")

            from tools.suggest_destination import handle_suggest_destination
            import cache; cache._cache.clear()

            result = handle_suggest_destination("beach")

        # Should still return search results even if scrape failed
        assert len(result["destinations"]) == 1
        assert result["detailed_info"] == ""


# ─── find_flights ─────────────────────────────────────────────────────────────

class TestFindFlights:
    def test_returns_skyscanner_url_for_known_cities(self):
        import cache; cache._cache.clear()
        from tools.find_flights import handle_find_flights

        result = handle_find_flights(
            destination_city="Barcelona",
            origin_city="New York",
            depart_date="2026-05-23",
            return_date="2026-06-02",
            passengers=1,
        )

        assert "options" in result
        assert len(result["options"]) == 1
        url = result["options"][0]["skyscanner_url"]
        assert "jfk" in url.lower()
        assert "bcn" in url.lower()
        assert "260523" in url
        assert "260602" in url

    def test_returns_fallback_for_unknown_destination(self):
        import cache; cache._cache.clear()
        from tools.find_flights import handle_find_flights

        result = handle_find_flights(
            destination_city="Atlantis",
            origin_city="New York",
            depart_date="2026-06-01",
            return_date="2026-06-10",
        )

        assert "options" in result
        assert "skyscanner.com/flights/" in result["options"][0]["skyscanner_url"]

    def test_skyscanner_url_format(self):
        import cache; cache._cache.clear()
        from tools.find_flights import handle_find_flights

        result = handle_find_flights("Rome", "London", "2026-07-15", "2026-07-22")
        url = result["options"][0]["skyscanner_url"]
        assert url.startswith("https://www.skyscanner.com/transport/flights/")
        assert "lhr" in url  # London LHR
        assert "fco" in url  # Rome FCO


# ─── find_hotels ──────────────────────────────────────────────────────────────

class TestFindHotels:
    def test_returns_hotels_from_search(self):
        items = [
            _mock_web_item(
                "https://www.booking.com/hotel/it/bue-marino.html",
                "Hotel Bue Marino, Sardinia",
                "Beachfront 4-star hotel",
            )
        ]
        with patch("tools.find_hotels.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result(items)
            mock_fc.scrape.return_value = _mock_scrape_result("# Bue Marino\n4 stars.")

            from tools.find_hotels import handle_find_hotels
            import cache; cache._cache.clear()

            result = handle_find_hotels("Sardinia", "2026-05-23", "2026-06-02")

        assert "hotels" in result
        assert len(result["hotels"]) >= 1
        assert "booking_search_url" in result

    def test_booking_search_url_contains_destination(self):
        with patch("tools.find_hotels.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result([])

            from tools.find_hotels import handle_find_hotels
            import cache; cache._cache.clear()

            result = handle_find_hotels("Barcelona", "2026-05-01", "2026-05-10")

        assert "Barcelona" in result["booking_search_url"] or "arcelona" in result["booking_search_url"]

    def test_returns_fallback_on_firecrawl_error(self):
        with patch("tools.find_hotels.firecrawl") as mock_fc:
            mock_fc.search.side_effect = Exception("timeout")

            from tools.find_hotels import handle_find_hotels
            import cache; cache._cache.clear()

            result = handle_find_hotels("Paris", "2026-06-01", "2026-06-07")

        assert "hotels" in result
        assert "booking_search_url" in result


# ─── find_activities ──────────────────────────────────────────────────────────

class TestFindActivities:
    def test_returns_activities_from_search(self):
        items = [
            _mock_web_item("https://example.com/snorkel", "Snorkeling in Sardinia", "Best spots"),
            _mock_web_item("https://example.com/hike", "Hiking trails Sardinia", "Top hikes"),
        ]
        with patch("tools.find_activities.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result(items)
            mock_fc.scrape.return_value = _mock_scrape_result("# Things to do\n1. Snorkel")

            from tools.find_activities import handle_find_activities
            import cache; cache._cache.clear()

            result = handle_find_activities("Sardinia", "outdoor quiet")

        assert "activities" in result
        assert len(result["activities"]) == 2
        assert result["activities"][0]["name"] == "Snorkeling in Sardinia"

    def test_empty_preferences_still_works(self):
        items = [_mock_web_item("https://example.com", "Things to do in Rome", "Many options")]
        with patch("tools.find_activities.firecrawl") as mock_fc:
            mock_fc.search.return_value = _mock_search_result(items)
            mock_fc.scrape.return_value = _mock_scrape_result("Content here.")

            from tools.find_activities import handle_find_activities
            import cache; cache._cache.clear()

            result = handle_find_activities("Rome")

        assert len(result["activities"]) == 1

    def test_returns_fallback_on_firecrawl_error(self):
        with patch("tools.find_activities.firecrawl") as mock_fc:
            mock_fc.search.side_effect = Exception("rate limit")

            from tools.find_activities import handle_find_activities
            import cache; cache._cache.clear()

            result = handle_find_activities("Tokyo", "cultural")

        assert "error" in result
        assert "fallback_message" in result
        assert result["activities"] == []
