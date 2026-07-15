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
                print("Using cached geocode for address:", address)
                lat, long = geo_cache[address]
            record["latitude"] = lat
            record["longitude"] = long

            record.pop("Address", None)
        return records

    dataset["contributions"] = process_records(
        dataset.get("contributions", [])
    )
    print("Geocoding contributions completed.")
    dataset["expenditures"] = process_records(
        dataset.get("expenditures", [])
    )
    print("Geocoding expenditures completed.")

    dataset["personal_funds_expenditures"] = process_records(
        dataset.get("personal_funds_expenditures", [])
    )
    print("Geocoding personal funds expenditures completed.")

    dataset["in_kind_contributions"] = process_records(
        dataset.get("in_kind_contributions", [])
    )
    print("Geocoding in-kind contributions completed.")

    dataset["credit_card_expenditures"] = process_records(
        dataset.get("credit_card_expenditures", [])
    )
    print("Geocoding credit card expenditures completed.")

    return dataset
