"""find_flights tool — constructs Skyscanner deep-link URLs.

No live scraping: Skyscanner and Google Flights have aggressive anti-bot
protection that makes real-time price scraping unreliable. Instead, we
construct parametric search URLs that land the user on a pre-filtered
Skyscanner search page.

Skyscanner deep-link format:
  https://www.skyscanner.com/transport/flights/{from}/{to}/{depart}/{return}/
  (IATAs lowercase, dates YYMMDD)
"""

import cache
from iata import lookup_iata, date_to_skyscanner


def handle_find_flights(
    destination_city: str,
    origin_city: str,
    depart_date: str,
    return_date: str,
    passengers: int = 1,
) -> dict:
    cached = cache.get("find_flights", destination_city)
    if cached:
        # Cached entry exists but dates may differ — return as-is for demo purposes.
        # Production would key on dates too; excluded here per design doc.
        return cached

    dest_iata = lookup_iata(destination_city)
    orig_iata = lookup_iata(origin_city)

    if not dest_iata:
        # Unknown destination: fall back to generic Skyscanner search
        return {
            "options": [
                {
                    "label": f"Search Skyscanner: {origin_city} → {destination_city}",
                    "skyscanner_url": "https://www.skyscanner.com/flights/",
                    "note": (
                        f"Could not resolve IATA code for '{destination_city}'. "
                        "Search manually on Skyscanner."
                    ),
                }
            ]
        }

    depart_sk = date_to_skyscanner(depart_date)
    return_sk = date_to_skyscanner(return_date)

    from_code = orig_iata.lower() if orig_iata else "anywhere"
    to_code = dest_iata.lower()

    skyscanner_url = (
        f"https://www.skyscanner.com/transport/flights/"
        f"{from_code}/{to_code}/{depart_sk}/{return_sk}/"
    )

    origin_label = f"{origin_city} ({orig_iata})" if orig_iata else origin_city
    dest_label = f"{destination_city} ({dest_iata})"

    response = {
        "options": [
            {
                "label": f"{origin_label} → {dest_label}",
                "skyscanner_url": skyscanner_url,
                "depart_date": depart_date,
                "return_date": return_date,
                "passengers": passengers,
                "estimated_price": "Check Skyscanner for live prices",
                "note": (
                    "Typically 1–2 stops depending on route. "
                    "Click the link to see real-time fares."
                ),
            }
        ]
    }

    cache.set("find_flights", destination_city, response)
    return response
