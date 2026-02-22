import re

ZIP_REGEX = re.compile(
    r"\b(\d{5})(?:-\d{4})?\b$"
)

def extract_zipcode(address: str):
    """
    Extracts a 5-digit ZIP code from an address string.
    Handles ZIP+4 but returns only first 5 digits.
    Returns None if no valid ZIP found.
    """
    if not address:
        return None

    match = ZIP_REGEX.search(address)

    if match:
        return match.group(1)

    return None
