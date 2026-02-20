import re

ABBREVIATIONS = {
    r"\bStreet\b": "St",
    r"\bRoad\b": "Rd",
    r"\bAvenue\b": "Ave",
    r"\bBoulevard\b": "Blvd",
    r"\bDrive\b": "Dr",
    r"\bLane\b": "Ln",
    r"\bCourt\b": "Ct",
    r"\bPlace\b": "Pl",
    r"\bHighway\b": "Hwy",
    r"\bApartment\b": "Apt",
    r"\bSuite\b": "Ste"
}

def normalize_address(address: str) -> str:
    if not address:
        return ""

    address = address.strip()

    for pattern, replacement in ABBREVIATIONS.items():
        address = re.sub(pattern, replacement, address, flags=re.IGNORECASE)

    # Collapse extra spaces
    address = re.sub(r"\s+", " ", address)

    return address
