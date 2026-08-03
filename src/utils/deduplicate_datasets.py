"""
    Objective:
        Given 2 datasets (.json files), evaluate uniqueness and 
        delete records from the bulk dataset that are already 
        recorded in the discretized dataset
"""
from datetime import datetime
import json
from difflib import SequenceMatcher
import re

bulk_filename = "C:\\Users\\isaia\\Documents\\grassrooted.github.io\\public\\candidates\\WilliamRoth\\Sources\\srp0000002939_20250703_172346.json"
discretized_filenames = [
    "C:\\Users\\isaia\\Documents\\grassrooted.github.io\\public\\candidates\\WilliamRoth\\Sources\\tec0000002814_20250327_162419.json",
    "C:\\Users\\isaia\\Documents\\grassrooted.github.io\\public\\candidates\\WilliamRoth\\Sources\\tec0000002869_20250424_150912.json",
    "C:\\Users\\isaia\\Documents\\grassrooted.github.io\\public\\candidates\\WilliamRoth\\Sources\\tec0000002927_20250529_125240.json"
    ]

AUTO_THRESHOLD = 1.0
REVIEW_THRESHOLD = 0.75

FIELD_WEIGHTS = {
    "Latitude": 5,
    "Longitude": 5,
    "Name": 4,
    "Description": 2,
    "Category": 1,
}


"""
optional field weights

FIELD_WEIGHTS = {
    "Latitude": 10,
    "Longitude": 10,

    "Transaction_Date": 10,
    "Amount": 10,

    "Name": 3,
    "Address": 3,

    "City_State_Zip": 2,

    "Description": 1,
    "Category": 1
}

"""

skip_fields = ["metadata", "candidate_info", "edit_log", "Source", "Page", "record_id"]
compound_key_fields = ["Transaction_Date", "Amount"]

def normalize(value):
    """
    Normalize text for fuzzy comparison.
    """
    if value is None:
        return ""

    value = str(value).lower().strip()

    # remove punctuation
    value = re.sub(r"[^\w\s]", "", value)

    # collapse whitespace
    value = " ".join(value.split())

    return value


def similarity(a, b):
    a = normalize(a)
    b = normalize(b)

    if not a or not b:
        return 0.0

    return SequenceMatcher(None, a, b).ratio()


def score_records(bulk_record, discretized_record):

    score = 0
    max_score = 0

    for field, weight in FIELD_WEIGHTS.items():

        bulk_value = bulk_record.get(field)
        disc_value = discretized_record.get(field)

        #
        # Ignore missing values
        #
        if not bulk_value or not disc_value:
            continue

        max_score += weight

        #
        # Coordinates must match exactly
        #
        if field in ("latitude", "longitude"):

            if str(bulk_value) == str(disc_value):
                score += weight

            continue

        score += similarity(
            bulk_value,
            disc_value
        ) * weight

    if max_score == 0:
        return 0

    return score / max_score

def compare_records(bulk_record, discretized_record):

    print("=" * 70)

    print("\nMATCHING")
    print("-" * 20)

    for field in bulk_record.keys():

        if field in skip_fields:
            continue

        bulk_value = bulk_record.get(field)
        disc_value = discretized_record.get(field)

        if normalize(bulk_value) == normalize(disc_value) and bulk_value not in ("", None):
            print(f"✓ {field}: {bulk_value}")

    print("\nDIFFERENT")
    print("-" * 20)

    for field in bulk_record.keys():

        if field in skip_fields:
            continue

        bulk_value = bulk_record.get(field)
        disc_value = discretized_record.get(field)

        if (
            bulk_value not in ("", None)
            and disc_value not in ("", None)
            and normalize(bulk_value) != normalize(disc_value)
        ):
            print(field)
            print(f"    Bulk : {bulk_value}")
            print(f"    Disc : {disc_value}")
            print()

            # SAVE TO THE DISCRETIZED
            # only update the occupation/employer fields
            if field in ("Occupation", "Employer"):
                bulk_record[field] = disc_value

            if field in ("Transaction_Type"):
                discretized_record[field] = bulk_value

    print("\nMISSING IN BULK")
    print("-" * 20)

    for field in discretized_record.keys():

        if field in skip_fields:
            continue

        bulk_value = bulk_record.get(field)
        disc_value = discretized_record.get(field)

        if bulk_value in ("", None) and disc_value not in ("", None):

            print(field)
            print(f"    Disc : {disc_value}")
            bulk_record[field] = disc_value

    print("\nMISSING IN DISCRETIZED")
    print("-" * 20)

    for field in bulk_record.keys():

        if field in skip_fields:
            continue

        bulk_value = bulk_record.get(field)
        disc_value = discretized_record.get(field)

        if disc_value in ("", None) and bulk_value not in ("", None):

            print(field)
            print(f"    Bulk : {bulk_value}")
            discretized_record[field] = bulk_value

    print("=" * 70)

    return bulk_record, discretized_record

def print_record(record):
    for key in record.keys():
        print(f"{key}: {record[key]}")

def print_records(records):
    for r  in records:
        print_record(r)
        print("#####")

discretized_set = {}
# Build a shared dataset from all discretized files
for discretized_filename in discretized_filenames:
    with open(discretized_filename) as f:
        discretized = json.load(f)

    # Generate dict based on compound keys from discretized
    for parent in discretized.keys():
        # Only de-dupe the data fields, skip metadata | candidate_info | edit_log
        if parent in skip_fields:
            continue
        
        print(f"Synthesizing {parent}")

        # access the list of records for this parent field
        discretized_data = discretized[parent]

        # initialize an empty dict for the set
        if parent not in discretized_set.keys():
            discretized_set[parent] = {}

        # add each record to the appropriate compound key
        for record in discretized_data:
            compound_key = tuple(str(record[k]).lower() for k in compound_key_fields)
            if compound_key in discretized_set[parent]:
                    discretized_set[parent][compound_key].append(record)
            else:
                discretized_set[parent][compound_key] = [record]

###########################################################################

# Load the bulk dataset
bulk = {}
with open(bulk_filename) as f:
    bulk = json.load(f)

# Generate dict based on compound keys from bulk
bulk_set = {}
for parent in bulk.keys():
    if parent in skip_fields:
        continue

    # access the actual data for that field
    bulk_data = bulk[parent]

    # initialize an empty dict for the set
    bulk_set[parent] = {}
    print(f"Synthesizing {parent}")

    # read each record and add to the set at the appropriate compound key
    for record in bulk_data:
        compound_key = tuple(str(record[k]).lower() for k in compound_key_fields)
        if compound_key in bulk_set[parent]:
            bulk_set[parent][compound_key].append(record)
        else:
            bulk_set[parent][compound_key] = [record]

###########################################################################
bulk_processed = {}
discretized_processed = {}
# prep empty maps for each filename
for file in discretized_filenames:
    file = file.split("\\")[-1].split(".")[0] + ".pdf"
    discretized_processed[file] = {}

# Iterate over both sets to look for shared keys
for parent in bulk_set.keys():
    if parent in skip_fields:
        continue

    # check for edge case where a field is found in bulk but not in discretized
    if parent not in discretized_set.keys():
        print(f"Bulk contains the key {parent} that is not found in discretized. Press any key to continue")
        input()

    # access both shared datasets for the field
    bulk_data = bulk_set[parent]
    discretized_data = discretized_set[parent]

    # Synthesize both sets
    for compound_key in bulk_data:
        # RECRORDS THAT'RE ONLY FOUND IN BULK DATA (MISSING IN DISC)
        if compound_key not in discretized_data:
            for bulk_record in bulk_data[compound_key]:
                if parent in bulk_processed:
                    bulk_processed[parent].append(bulk_record)
                else:
                    bulk_processed[parent] = [bulk_record]
            continue
        else:
            # iterate over the records for that key
            for bulk_record in bulk_data[compound_key]:
                best_score = 0
                best_record = None

                for discretized_record in discretized_data[compound_key]:

                    score = score_records(
                        bulk_record,
                        discretized_record
                    )

                    if score > best_score:
                        best_score = score
                        best_record = discretized_record
                
                if best_score >= REVIEW_THRESHOLD:

                    print(f"\nConfidence: {best_score:.2f}")

                    bulk_record, discretized_record = compare_records(
                        bulk_record,
                        best_record
                    )

                    input("\nPossible match. Press Enter...")

                    if parent in bulk_processed:
                        bulk_processed[parent].append(discretized_record)
                    else:
                        bulk_processed[parent] = [discretized_record]
                    

                else:
                    pretty_bulk = json.dumps(bulk_record, indent=4, sort_keys=True)
                    if parent in bulk_processed:
                        bulk_processed[parent].append(bulk_record)
                    else:
                        bulk_processed[parent] = [bulk_record]
                    # no match
                    continue

print("----------------Bulk Calculated Totals----------------")
for parent in bulk_processed:
    total = sum(record["Amount"] for record in bulk_processed[parent])
    print(f"{parent}: {total}")
print()
print("----------------Bulk Reported Totals----------------")
for t in bulk["candidate_info"]["report_totals"]:
    print(f"{t}: {bulk["candidate_info"]["report_totals"][t]}")

bulk_processed["candidate_info"] = bulk["candidate_info"]
bulk_processed["metadata"] = bulk["metadata"]

bulk_processed["metadata"]["verification_timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
bulk_processed["metadata"]["parse_version"] = "v2.0.0"
bulk_processed["edit_log"] = bulk["edit_log"]

filename = "bulk_deduplicated.json"
with open(filename, 'w') as json_file:
    json.dump(bulk_processed, json_file, indent=4)
    print(f"Bulk Data Saved to {filename}")