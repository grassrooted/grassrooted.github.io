from geocoder import NominatimGeocoder


def geocode_dataset(dataset: dict) -> dict:
    geocoder = NominatimGeocoder()

    def process_records(records):
        index = 0
        for record in records:
            index+=1
            address = record.get("Address")

            lat, long = geocoder.geocode(address)

            if index % 10 == 0:
                print(f"Success @{index}: {lat} / {long} | {address}")

            record["latitude"] = lat
            record["longitude"] = long

            record.pop("Address", None)
        return records

    dataset["contributions"] = process_records(
        dataset.get("contributions", [])
    )

    dataset["expenditures"] = process_records(
        dataset.get("expenditures", [])
    )

    return dataset
