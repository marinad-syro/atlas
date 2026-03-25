"""find_transport tool — flight + train options for a single city-to-city leg."""

import math
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from iata import lookup_iata, date_to_skyscanner, CITY_COORDS
from train_links import get_train_links, CITY_COUNTRY
import cache


def _haversine_km(city_a: str, city_b: str) -> float:
    """Rough distance in km between two cities using CITY_COORDS."""
    a = CITY_COORDS.get(city_a.lower().strip())
    b = CITY_COORDS.get(city_b.lower().strip())
    if not a or not b:
        return float("inf")

    R = 6371.0
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(h))


def handle_find_transport(
    origin_city: str,
    destination_city: str,
    travel_date: str,
    passengers: int = 1,
    mode: str = "auto",
) -> dict:
    """Return flight and/or train booking options for a single city-to-city leg."""
    distance_km = _haversine_km(origin_city, destination_city)

    if mode == "auto":
        prefer_train = distance_km < 700
    elif mode == "train":
        prefer_train = True
    else:
        prefer_train = False

    options: list[dict] = []
    label = f"{origin_city} → {destination_city}"

    # ── Train options ──────────────────────────────────────────────────────────
    train_links = get_train_links(origin_city, destination_city, travel_date)
    for tl in train_links:
        opt: dict = {
            "label": label,
            "mode": "train",
            "provider": tl["provider"],
            "url": tl["url"],
            "travel_date": travel_date,
        }
        if tl.get("note"):
            opt["note"] = tl["note"]
        # Add rough duration hints for well-known pairs
        pair = (origin_city.lower().strip(), destination_city.lower().strip())
        duration_hints: dict[tuple, str] = {
            ("paris", "barcelona"): "~6h 30m",
            ("barcelona", "paris"): "~6h 30m",
            ("paris", "amsterdam"): "~3h 20m",
            ("amsterdam", "paris"): "~3h 20m",
            ("london", "paris"): "~2h 20m",
            ("paris", "london"): "~2h 20m",
            ("london", "brussels"): "~1h 55m",
            ("brussels", "london"): "~1h 55m",
            ("madrid", "barcelona"): "~2h 30m",
            ("barcelona", "madrid"): "~2h 30m",
            ("rome", "milan"): "~3h",
            ("milan", "rome"): "~3h",
            ("rome", "florence"): "~1h 30m",
            ("florence", "rome"): "~1h 30m",
            ("milan", "venice"): "~2h 30m",
            ("venice", "milan"): "~2h 30m",
        }
        hint = duration_hints.get(pair)
        if hint:
            opt["duration_hint"] = hint
        options.append(opt)

    # ── Flight option ──────────────────────────────────────────────────────────
    orig_iata = lookup_iata(origin_city)
    dest_iata = lookup_iata(destination_city)

    if dest_iata:
        depart_sk = date_to_skyscanner(travel_date)
        from_code = orig_iata.lower() if orig_iata else "anywhere"
        to_code = dest_iata.lower()

        # One-way deep link (no return date for individual legs)
        skyscanner_url = (
            f"https://www.skyscanner.com/transport/flights/"
            f"{from_code}/{to_code}/{depart_sk}/"
        )

        origin_label = f"{origin_city} ({orig_iata})" if orig_iata else origin_city
        dest_label = f"{destination_city} ({dest_iata})"

        options.append({
            "label": f"{origin_label} → {dest_label}",
            "mode": "flight",
            "provider": "Skyscanner",
            "url": skyscanner_url,
            "travel_date": travel_date,
        })

    # Sort: preferred mode first
    if prefer_train:
        options.sort(key=lambda o: 0 if o["mode"] == "train" else 1)
    else:
        options.sort(key=lambda o: 0 if o["mode"] == "flight" else 1)

    return {"options": options}
