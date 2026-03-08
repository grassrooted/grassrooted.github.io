from geocoder import NominatimGeocoder


def geocode_dataset(geo_cache, dataset: dict) -> dict:
    geocoder = NominatimGeocoder()
    def process_records(records):
        index = 0
        for record in records:
            index+=1
            address = record.get("Address")
            if address not in geo_cache:
                lat, long = geocoder.geocode(address)
                geo_cache[address] = lat, long
            else:
                lat, long = geo_cache[address]
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
