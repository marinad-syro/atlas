"""Train deep-link URL builder for European routes."""

CITY_COUNTRY = {
    "paris": "france", "lyon": "france", "marseille": "france", "nice": "france", "bordeaux": "france",
    "london": "uk", "amsterdam": "netherlands", "brussels": "belgium",
    "madrid": "spain", "barcelona": "spain", "seville": "spain", "valencia": "spain",
    "rome": "italy", "milan": "italy", "florence": "italy", "venice": "italy", "naples": "italy",
    "berlin": "germany", "munich": "germany", "hamburg": "germany", "frankfurt": "germany",
    "zurich": "switzerland", "geneva": "switzerland",
    "vienna": "austria", "prague": "czechia", "budapest": "hungary", "lisbon": "portugal",
}

SNCF_CODES = {
    "paris": "FRPAR", "lyon": "FRLYS", "marseille": "FRMRS", "nice": "FRNIC",
    "bordeaux": "FRBOJ", "barcelona": "ESBAR", "madrid": "ESMAD",
    "brussels": "BEBMI", "amsterdam": "NLAMA", "london": "GBSPX",
}

RENFE_CITIES = {"madrid", "barcelona", "seville", "valencia"}

ITALIAN_CITIES = {"rome", "milan", "florence", "venice", "naples"}

EUROSTAR_PAIRS = {
    ("london", "paris"), ("paris", "london"),
    ("london", "brussels"), ("brussels", "london"),
    ("london", "amsterdam"), ("amsterdam", "london"),
}


def get_train_links(origin_city: str, destination_city: str, date: str) -> list[dict]:
    """
    Return a list of train booking options for this city pair.
    date is YYYY-MM-DD.
    Returns [] if no train route is applicable.
    """
    from_city = origin_city.lower().strip()
    to_city = destination_city.lower().strip()
    date_no_dashes = date.replace("-", "")

    options: list[dict] = []

    # Eurostar: London ↔ Paris / Brussels / Amsterdam
    if (from_city, to_city) in EUROSTAR_PAIRS:
        url = (
            f"https://www.eurostar.com/uk-en/train/search"
            f"?origin={from_city}&destination={to_city}"
            f"&outbound={date}T09:00:00&adults=1"
        )
        options.append({
            "provider": "Eurostar",
            "url": url,
            "note": "Direct high-speed service through the Channel Tunnel",
        })
        return options

    # SNCF Connect: both cities have SNCF codes
    if from_city in SNCF_CODES and to_city in SNCF_CODES:
        from_code = SNCF_CODES[from_city]
        to_code = SNCF_CODES[to_city]
        url = (
            f"https://www.sncf-connect.com/app/home/shop/search"
            f"?originCode={from_code}&destinationCode={to_code}"
            f"&outwardDate={date}T09:00:00"
        )
        options.append({
            "provider": "SNCF Connect",
            "url": url,
            "note": "High-speed TGV / Intercités",
        })
        return options

    # Renfe: either city is in Spain, other is Spain or France
    from_country = CITY_COUNTRY.get(from_city)
    to_country = CITY_COUNTRY.get(to_city)

    if (from_city in RENFE_CITIES or to_city in RENFE_CITIES) and (
        from_country in ("spain", "france") and to_country in ("spain", "france")
    ):
        url = (
            f"https://www.renfe.com/es/en/viajar/como-viajar/buscador-de-trenes"
            f"?origen={origin_city.upper()}&destino={destination_city.upper()}"
            f"&fecHorSalida={date_no_dashes}"
        )
        options.append({
            "provider": "Renfe",
            "url": url,
            "note": "Spanish high-speed AVE network",
        })
        return options

    # Italian cities among themselves → Trenitalia
    if from_city in ITALIAN_CITIES and to_city in ITALIAN_CITIES:
        options.append({
            "provider": "Trenitalia",
            "url": "https://www.trenitalia.com",
            "note": "Search trenitalia.com directly for Frecciarossa / Italo services",
        })
        return options

    # Fallback for unrecognized European routes → FlixBus
    if from_country or to_country:
        options.append({
            "provider": "FlixBus",
            "url": "https://www.flixbus.com/bus-routes",
            "note": "Budget-friendly intercity bus across Europe",
        })
        return options

    return []
