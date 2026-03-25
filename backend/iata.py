"""City name → IATA airport code lookup.

Covers ~70 common travel destinations. Sufficient for hackathon demos.
Add more entries as needed.
"""

from typing import Optional
import math

IATA_CODES: dict[str, str] = {
    # North America
    "new york": "JFK",
    "new york city": "JFK",
    "nyc": "JFK",
    "los angeles": "LAX",
    "la": "LAX",
    "chicago": "ORD",
    "san francisco": "SFO",
    "miami": "MIA",
    "boston": "BOS",
    "seattle": "SEA",
    "dallas": "DFW",
    "houston": "IAH",
    "atlanta": "ATL",
    "denver": "DEN",
    "las vegas": "LAS",
    "toronto": "YYZ",
    "montreal": "YUL",
    "vancouver": "YVR",
    "cancun": "CUN",
    "mexico city": "MEX",
    # South America
    "bogota": "BOG",
    "lima": "LIM",
    "buenos aires": "EZE",
    "rio de janeiro": "GIG",
    "sao paulo": "GRU",
    "santiago": "SCL",
    # Europe
    "london": "LHR",
    "paris": "CDG",
    "amsterdam": "AMS",
    "frankfurt": "FRA",
    "madrid": "MAD",
    "barcelona": "BCN",
    "rome": "FCO",
    "milan": "MXP",
    "zurich": "ZRH",
    "vienna": "VIE",
    "lisbon": "LIS",
    "porto": "OPO",
    "athens": "ATH",
    "nice": "NCE",
    "marseille": "MRS",
    "seville": "SVQ",
    "ibiza": "IBZ",
    "palma": "PMI",
    "mallorca": "PMI",
    "naples": "NAP",
    "venice": "VCE",
    "florence": "FLR",
    "sardinia": "CAG",
    "cagliari": "CAG",
    "santorini": "JTR",
    "mykonos": "JMK",
    "crete": "HER",
    "heraklion": "HER",
    "dubrovnik": "DBV",
    "split": "SPU",
    "prague": "PRG",
    "budapest": "BUD",
    "warsaw": "WAW",
    "istanbul": "IST",
    "stockholm": "ARN",
    "oslo": "OSL",
    "copenhagen": "CPH",
    "brussels": "BRU",
    "edinburgh": "EDI",
    "dublin": "DUB",
    # Middle East & Africa
    "dubai": "DXB",
    "cape town": "CPT",
    "nairobi": "NBO",
    "marrakech": "RAK",
    "cairo": "CAI",
    # Asia & Pacific
    "tokyo": "NRT",
    "osaka": "KIX",
    "singapore": "SIN",
    "hong kong": "HKG",
    "bangkok": "BKK",
    "bali": "DPS",
    "denpasar": "DPS",
    "kuala lumpur": "KUL",
    "jakarta": "CGK",
    "manila": "MNL",
    "mumbai": "BOM",
    "delhi": "DEL",
    "new delhi": "DEL",
    "seoul": "ICN",
    "sydney": "SYD",
    "melbourne": "MEL",
    "auckland": "AKL",
}


CITY_COORDS: dict[str, tuple[float, float]] = {
    # North America
    "new york": (40.6413, -73.7781),
    "new york city": (40.6413, -73.7781),
    "nyc": (40.6413, -73.7781),
    "los angeles": (33.9425, -118.4081),
    "la": (33.9425, -118.4081),
    "chicago": (41.9742, -87.9073),
    "san francisco": (37.6213, -122.3790),
    "miami": (25.7959, -80.2870),
    "boston": (42.3656, -71.0096),
    "seattle": (47.4502, -122.3088),
    "dallas": (32.8998, -97.0403),
    "houston": (29.9902, -95.3368),
    "atlanta": (33.6407, -84.4277),
    "denver": (39.8561, -104.6737),
    "las vegas": (36.0840, -115.1537),
    "toronto": (43.6777, -79.6248),
    "montreal": (45.5175, -73.7400),
    "vancouver": (49.1967, -123.1815),
    "cancun": (21.0366, -86.8771),
    "mexico city": (19.4363, -99.0721),
    # South America
    "bogota": (4.7016, -74.1469),
    "lima": (-12.0219, -77.1143),
    "buenos aires": (-34.8222, -58.5358),
    "rio de janeiro": (-22.8099, -43.2505),
    "sao paulo": (-23.5558, -46.6322),
    "santiago": (-33.3928, -70.7858),
    # Europe
    "london": (51.4700, -0.4543),
    "paris": (49.0097, 2.5479),
    "amsterdam": (52.3086, 4.7639),
    "frankfurt": (50.0379, 8.5622),
    "madrid": (40.4983, -3.5676),
    "barcelona": (41.2974, 2.0833),
    "rome": (41.8003, 12.2389),
    "milan": (45.6306, 8.7281),
    "zurich": (47.4647, 8.5492),
    "vienna": (48.1103, 16.5697),
    "lisbon": (38.7756, -9.1354),
    "porto": (41.2370, -8.6704),
    "athens": (37.9364, 23.9445),
    "nice": (43.6653, 7.2150),
    "marseille": (43.4365, 5.2150),
    "lyon": (45.7256, 5.0811),
    "bordeaux": (44.8283, -0.7153),
    "seville": (37.4180, -5.8931),
    "ibiza": (38.8728, 1.3731),
    "palma": (39.5517, 2.7388),
    "mallorca": (39.5517, 2.7388),
    "naples": (40.8860, 14.2908),
    "venice": (45.5053, 12.3520),
    "florence": (43.8099, 11.2050),
    "sardinia": (39.2238, 9.1217),
    "cagliari": (39.2517, 9.0543),
    "santorini": (36.4072, 25.4594),
    "mykonos": (37.4356, 25.3479),
    "crete": (35.3387, 25.1442),
    "heraklion": (35.3387, 25.1442),
    "dubrovnik": (42.5614, 18.2683),
    "split": (43.5388, 16.2978),
    "prague": (50.1008, 14.2632),
    "budapest": (47.4369, 19.2556),
    "warsaw": (52.1657, 20.9671),
    "istanbul": (40.9769, 28.8146),
    "stockholm": (59.6519, 17.9186),
    "oslo": (60.1939, 11.1004),
    "copenhagen": (55.6180, 12.6508),
    "brussels": (50.9010, 4.4856),
    "edinburgh": (55.9500, -3.3725),
    "dublin": (53.4273, -6.2436),
    "hamburg": (53.6304, 9.9882),
    "munich": (48.3537, 11.7750),
    "berlin": (52.3667, 13.5033),
    "geneva": (46.2381, 6.1080),
    "valencia": (39.4893, -0.4816),
    # Middle East & Africa
    "dubai": (25.2532, 55.3657),
    "cape town": (-33.9648, 18.6017),
    "nairobi": (-1.3192, 36.9275),
    "marrakech": (31.6069, -8.0363),
    "cairo": (30.1219, 31.4056),
    # Asia & Pacific
    "tokyo": (35.7720, 140.3929),
    "osaka": (34.4275, 135.2440),
    "singapore": (1.3644, 103.9915),
    "hong kong": (22.3080, 113.9185),
    "bangkok": (13.6900, 100.7501),
    "bali": (-8.7467, 115.1671),
    "denpasar": (-8.7467, 115.1671),
    "kuala lumpur": (2.7456, 101.7072),
    "jakarta": (-6.1256, 106.6559),
    "manila": (14.5086, 121.0194),
    "mumbai": (19.0896, 72.8656),
    "delhi": (28.5562, 77.1000),
    "new delhi": (28.5562, 77.1000),
    "seoul": (37.4602, 126.4407),
    "sydney": (-33.9461, 151.1772),
    "melbourne": (-37.6690, 144.8410),
    "auckland": (-37.0082, 174.7850),
}


def nearest_neighbor_order(cities: list[str], origin: str) -> list[str]:
    """Return cities reordered to minimize total travel distance from origin.

    Uses Euclidean distance on lat/lon as a good-enough approximation.
    Cities whose coordinates are unknown are appended at the end in original order.
    """
    origin_key = origin.lower().strip()
    origin_coords = CITY_COORDS.get(origin_key)

    known = []
    unknown = []
    for city in cities:
        if city.lower().strip() in CITY_COORDS:
            known.append(city)
        else:
            unknown.append(city)

    if not origin_coords or not known:
        return cities[:]

    ordered: list[str] = []
    remaining = known[:]
    current_coords = origin_coords

    while remaining:
        def _dist(city: str) -> float:
            coords = CITY_COORDS[city.lower().strip()]
            dlat = coords[0] - current_coords[0]
            dlon = coords[1] - current_coords[1]
            return math.sqrt(dlat * dlat + dlon * dlon)

        nearest = min(remaining, key=_dist)
        ordered.append(nearest)
        current_coords = CITY_COORDS[nearest.lower().strip()]
        remaining.remove(nearest)

    return ordered + unknown


def lookup_iata(city: str) -> Optional[str]:
    """Return IATA code for a city, or None if not found."""
    return IATA_CODES.get(city.lower().strip())


def date_to_skyscanner(date_str: str) -> str:
    """Convert YYYY-MM-DD to YYMMDD for Skyscanner deep-link URLs.

    Example: "2026-05-23" → "260523"
    """
    return date_str.replace("-", "")[2:]
