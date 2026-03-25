"""plan_route tool — orders cities and splits days across them."""

import math
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from iata import nearest_neighbor_order, CITY_COORDS
from datetime import date, timedelta
import cache


def handle_plan_route(
    cities: list[str],
    origin_city: str,
    total_days: int,
    start_date: str,
) -> dict:
    """Order cities and build a legs itinerary with per-city day splits."""
    # Parse start_date
    try:
        trip_start = date.fromisoformat(start_date)
    except ValueError:
        trip_start = date.today()

    # Order cities using nearest-neighbor from origin (falls back gracefully)
    ordered = nearest_neighbor_order(cities, origin_city)

    n = len(ordered)
    if n == 0:
        return {"ordered_cities": [], "legs": []}

    # Split total_days evenly; last city absorbs remainder
    days_per_city = total_days // n
    remainder = total_days % n

    # Build legs
    legs = []
    current_date = trip_start

    for i, city in enumerate(ordered):
        nights = days_per_city + (remainder if i == n - 1 else 0)
        arrive_str = current_date.isoformat()
        depart_dt = current_date + timedelta(days=nights)
        depart_str = depart_dt.isoformat()

        from_city = origin_city if i == 0 else ordered[i - 1]
        legs.append({
            "from": from_city,
            "to": city,
            "arrive": arrive_str,
            "depart": depart_str,
            "nights": nights,
        })
        current_date = depart_dt

    # Return leg: last city → origin
    legs.append({
        "from": ordered[-1],
        "to": origin_city,
        "arrive": current_date.isoformat(),
        "depart": current_date.isoformat(),
        "nights": 0,
    })

    result = {
        "ordered_cities": ordered,
        "legs": legs,
    }
    return result
