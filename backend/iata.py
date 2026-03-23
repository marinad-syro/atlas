"""City name → IATA airport code lookup.

Covers ~70 common travel destinations. Sufficient for hackathon demos.
Add more entries as needed.
"""

from typing import Optional

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


def lookup_iata(city: str) -> Optional[str]:
    """Return IATA code for a city, or None if not found."""
    return IATA_CODES.get(city.lower().strip())


def date_to_skyscanner(date_str: str) -> str:
    """Convert YYYY-MM-DD to YYMMDD for Skyscanner deep-link URLs.

    Example: "2026-05-23" → "260523"
    """
    return date_str.replace("-", "")[2:]
