import requests
import time
from address_normalizer import normalize_address
from zip_extractor import extract_zipcode

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "User-Agent": "MunicipalCampaignFinanceTransparency/1.0 (isaiahmercadotx@gmail.com)"
}

REQUEST_DELAY = 1.1


class NominatimGeocoder:
    def __init__(self):
        self.cache = {}

    def _request(self, query: str):
        if not query:
            return None

        if query in self.cache:
            return self.cache[query]

        params = {
            "q": query,
            "format": "json",
            "limit": 1,
            "countrycodes": "us"
        }

        try:
            response = requests.get(
                NOMINATIM_URL,
                params=params,
                headers=HEADERS,
                timeout=10
            )

            if response.status_code != 200:
                return None

            data = response.json()

            if not data:
                return None

            lat = round(float(data[0]["lat"]), 3)
            lon = round(float(data[0]["lon"]), 3)

            result = (lat, lon)
            self.cache[query] = result

            time.sleep(REQUEST_DELAY)
            return result

        except Exception:
            return None

    def geocode(self, address: str):
        """
        1. Try normalized full address
        2. If fails → extract ZIP from address
        3. Try ZIP lookup
        """

        if not address:
            return None, None

        normalized = normalize_address(address)

        # 1Full address lookup
        result = self._request(normalized)
        if result:
            return result

        # Fallback: Extract ZIP from address string
        zipcode = extract_zipcode(address)

        if zipcode:
            result = self._request(zipcode)
            if result:
                return result

        return None, None
