from utils.geocoder import NominatimGeocoder


def geocode_dataset(dataset: dict) -> dict:
    geocoder = NominatimGeocoder()

    def process_records(records):
        for record in records:
            address = record.get("Address")

            lat, lon = geocoder.geocode(address)

            record["latitude"] = lat
            record["longitude"] = lon

            record.pop("Address", None)

        return records

    dataset["contributions"] = process_records(
        dataset.get("contributions", [])
    )

    dataset["expenditures"] = process_records(
        dataset.get("expenditures", [])
    )

    return dataset
