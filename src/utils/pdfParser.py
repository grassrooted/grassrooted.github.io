import pdfplumber
import re
import json
import os
import requests
from datetime import date, datetime

FIRST_NAME_CONFIG = "Adriana"
LAST_NAME_CONFIG = "Garcia"
related_tec_docs_filename = f"{FIRST_NAME_CONFIG}_{LAST_NAME_CONFIG}_2016_2025.txt"

def extract_transaction_type(flat_text, defaultType):
        print(f"Extracting transaction type from text: {flat_text}")
        if "Officeholder Funds for Officeholder Expenditures" in flat_text:
            transaction_type = "Officeholder Funds for Officeholder Expenditures"
        elif "Campaign Funds for Campaign Expenditures" in flat_text:
            transaction_type = "Campaign Funds for Campaign Expenditures"
        elif "Officeholder Funds for Campaign Expenditures" in flat_text:
            transaction_type = "Officeholder Funds for Campaign Expenditures"
        elif "Campaign Funds for Officeholder Expenditures" in flat_text:
            transaction_type = "Campaign Funds for Officeholder Expenditures"
        elif "Campaign Contribution" in flat_text:
            transaction_type = "Campaign Contribution"
        else:
            transaction_type = defaultType
        return transaction_type

# ---------------- NEW: SCHEDULE G ----------------
def parse_schedule_g_record(table, page_num, pdf_path):
    try:
        tokens = []
        for row in table:
            for cell in row:
                if cell:
                    tokens.extend(cell.split("\n"))

        tokens = [t.strip() for t in tokens if t.strip()]

        raw_tokens = " ".join(tokens)

        date = None
        name = None
        amount = None
        category = None
        description = None

        state = None  # controls parsing context

        transaction_type = extract_transaction_type(raw_tokens, "Personal Funds Expenditure")

        i = 0
        while i < len(tokens):
            t = tokens[i].lower()

            # ---------------- DATE ----------------
            if "date" in t and i + 1 < len(tokens):
                if re.match(r"\d{1,2}/\d{1,2}/\d{4}", tokens[i + 1]):
                    date = datetime.strptime(tokens[i + 1], "%m/%d/%Y").strftime("%Y-%m-%d")

            # ---------------- NAME ----------------
            elif "payee name" in t and i + 1 < len(tokens):
                name = tokens[i + 1]

            # ---------------- AMOUNT ----------------
            elif "amount" in t:
                for j in range(i + 1, min(i + 5, len(tokens))):
                    cleaned = tokens[j].replace(",", "")
                    if re.match(r"^\d+(\.\d{2})?$", cleaned):
                        amount = float(cleaned)
                        break
                if not amount:
                    #edge case: supplemental -- amount is on same line as field
                    amount = float(t.split("($)")[-1])

            # ---------------- CATEGORY BLOCK START ----------------
            elif "category" in t:
                state = "category"

            elif state == "category":
                # first meaningful line after header is the category
                if tokens[i] and "see categories" not in t:
                    category = tokens[i]
                    state = None

            # ---------------- DESCRIPTION BLOCK ----------------
            elif "description" in t:
                state = "description"

            elif state == "description":
                # first meaningful line after label is description
                if tokens[i] and "expense description" not in t:
                    description = tokens[i]
                    state = None
            elif "payee address" in t:
                state = "payee address"
            elif state == "payee address":
                # first meaningful line after label is address
                if tokens[i]:
                    address = tokens[i]
                    state = None

            i += 1

        # ---------------- CLEANUP ----------------
        if description:
            description = description.strip()

        if category:
            category = category.strip()

        if address:
            address = address.strip()

        if date and name and amount:

            return {
                "Transaction_Date": date,
                "Name": name,
                "Address": address,
                "Amount": amount,
                "Category": category,
                "Description": description,
                "Transaction_Type": transaction_type,
                "Schedule": "G",
                "Page": page_num,
                "Source": pdf_path.split("\\")[-1]
            }

        return None

    except Exception as e:
        print(f"Schedule G parse error: {e}")
        return None

def parseEmployer(row):
    return row[-2].split("\n")[-1].replace("Employer", "")\
            .replace("\n"," ")\
            .replace("9 ","")\
            .replace("(See Instructions)", "")\
            .strip()\
            .title()
            

def parseOccupation(row):
    return row[0].split("\n")[-1].replace("Principal occupation", "")\
        .replace("Job title", "")\
        .replace("8", "")\
        .replace("(See Instructions)", "")\
        .replace("/","")\
        .strip().title()

def extract_filename_from_url(url):
    return url.split("/")[-1]


def download_pdf(url, output_dir):
    try:
        filename = extract_filename_from_url(url)
        filepath = os.path.join(output_dir, filename)

        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            response = requests.get(url)
            with open(filepath, "wb") as file:
                file.write(response.content)
        else:
            print(f"{filename} already exists locally.")
        return filepath
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None


def extract_finance_data_from_table(pdf_path):
    data = {
        "candidate_info": {},
        "contributions": [],
        "expenditures": [],
        "in_kind_contributions": [],
        # NEW COLLECTION
        "personal_funds_expenditures": []
    }

    # ---------------- HEADER HELPERS ----------------
    def extract_office(flat_text):
        pattern = r"13\s*OFFICE\s*SOUGHT\s*\(if known\)\s*([A-Za-z]+\s*District\s*\d+)"
        match = re.search(pattern, flat_text)
        return match.group(1).strip() if match else "Not Found"

    def extract_first_name(flat_text):
        match = re.search(
            r"CANDIDATE /OFFICEHOLDERNAME.*?\bFIRST MI\s*Mr\s+(\w+)",
            flat_text,
            re.IGNORECASE
        )
        return match.group(1).title().strip() if match else "Not Found"

    def extract_last_name(table):
        last_name_row = table[3]
        for row in table:
            for cell in row:
                if cell and "3 CANDIDATE /\nOFFICEHOLDER\nNAME" in cell:
                    last_name_row = row
        for cell in last_name_row:
            if cell and "NICKNAME LAST SUFFIX" in cell:
                return cell.replace("\n", " ").split(" ")[-1].title().strip()
        return None

    def extract_unitemized_reported_totals(table):
        reported_totals = {}
        text = " ".join(str(item) for row in table for item in row if item).replace("\n", " ")

        if "TOTAL POLITICAL CONTRIBUTIONS MAINTAINED AS OF THE LAST DAY OF REPORTING PERIOD $" in text:
            contributions_maintained = text.split(" TOTAL POLITICAL CONTRIBUTIONS MAINTAINED AS OF THE LAST DAY OF REPORTING PERIOD $ ")[-1].split(" ")[0].replace(",", "")
            reported_totals["Contribution Balance"] = contributions_maintained
        elif "TOTAL PRINCIPAL AMOUNT OF ALL OUTSTANDING LOANS AS OF THE LAST DAY OF THE REPORTING PERIOD $" in text:
            loans_outstanding = text.split(" TOTAL PRINCIPAL AMOUNT OF ALL OUTSTANDING LOANS AS OF THE LAST DAY OF THE REPORTING PERIOD $ ")[-1].split(" ")[0].replace(",", "")
            reported_totals["Outstanding Loan Totals"] = loans_outstanding
        return reported_totals

    def extract_period_covered(table):
        """
        Extract reporting period from the C/OH cover sheet.

        Returns:
            "YYYY-MM-DD_YYYY-MM-DD"
            or
            "None_None"
        """

        DATE_PATTERN = re.compile(r"(\d{2})\s+(\d{2})\s+(\d{4})")
        try:
            for i, row in enumerate(table):

                # Flatten the row into one searchable string
                row_text = " ".join(
                    str(cell) for cell in row if cell
                )

                normalized = " ".join(row_text.split()).upper()

                if "PERIOD COVERED" not in normalized:
                    continue

                # Sometimes the dates are on the next row
                search_text = row_text

                if i + 1 < len(table):
                    next_row = " ".join(
                        str(cell)
                        for cell in table[i + 1]
                        if cell
                    )
                    search_text += " " + next_row

                matches = DATE_PATTERN.findall(search_text)

                if len(matches) >= 2:

                    start = matches[0]
                    end = matches[1]

                    start_date = f"{start[2]}-{start[0]}-{start[1]}"
                    end_date = f"{end[2]}-{end[0]}-{end[1]}"

                    return [start_date, end_date]
        except Exception as e:
            # print(f"Error extracting period covered: {e}")
            return ["None", "None"]
        return ["None", "None"]

    def parse_header_page(table):
        flat_text = " ".join(str(c) for row in table for c in row if c)
        start, end = extract_period_covered(table)

        return {
            "candidate_info": {
                "first_name": extract_first_name(flat_text),
                "last_name": extract_last_name(table),
                "office_sought": extract_office(flat_text),
                "period_start": start,
                "period_end": end
            }
        }

    # ---------------- A1 / CONTRIBUTIONS ----------------
    def parse_con_address(row):
        return row[-3].split("\n")[-1]\
            .replace("Contributor address", "")\
            .replace("City", "")\
            .replace("State","")\
            .replace("Zip Code", "")\
            .replace(";","")\
            .replace("6","")\
            .strip()

    def parse_contribution_record(row, next_row, page_num):
        try:
            date = row[0].split("\n")[1].strip()
            donor_name = row[1].split("\n")[1].strip()

            amount = float(row[-1].split("\n")[-1].replace(",", "").strip())

            address = parse_con_address(row)

            occupation = parseOccupation(next_row)
            employer = parseEmployer(next_row)

            return {
                "Transaction_Date": datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d"),
                "Name": donor_name,
                "Amount": amount,
                "Address": address,
                "Occupation": occupation,
                "Employer": employer,
                "Transaction_Type": "Contribution",
                "Source": pdf_path.split("\\")[-1],
                "Schedule": "A1",
                "Page": page_num
            }
        except:
            return None

    def sanitize_addr(addr):
        return addr.replace("\n", " ")\
                .replace("Contributor address", "")\
                .replace("City", "")\
                .replace("State","")\
                .replace("Zip Code", "")\
                .replace(";","")\
                .replace("6","")\
                .strip()

    def sanitize_exp_description(description):
        return description.replace("(b)", "")\
                .replace("Description", "")
    # ---------------- F1 EXPENDITURES ----------------
    def parse_expenditure_record(record, page_num):
        try:
            date = record[0][0].split("\n")[1]
            payee = record[0][1].split("\n")[1]

            amount = float(re.search(r'\d+(?:,\d{3})*(?:\.\d{2})', record[1][0]).group().replace(",", ""))

            address = sanitize_addr(" ".join(record[1][1].split("\n")[1:]))
            category = record[2][1].split("\n")[1]
            description = sanitize_exp_description(record[2][2].replace("\n", " ").strip())

            return {
                "Transaction_Date": datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d"),
                "Name": payee,
                "Amount": amount,
                "Address": address,
                "Category": category,
                "Description": description,
                "Transaction_Type": "Expenditure",
                "Source": pdf_path.split("\\")[-1],
                "Schedule": "F1",
                "Page": page_num
            }
        except:
            return None

    
    # ---------------- PROCESS PDF ----------------
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                continue

            page_title = " ".join(str(c) for c in tables[0][0] if c)

            # HEADER
            if page_num == 0:
                data["candidate_info"] = parse_header_page(tables[0])["candidate_info"]

            # SUMMARY PAGE
            elif page_num == 1:
                totals = extract_unitemized_reported_totals(tables[0])
                data["candidate_info"]["report_totals"] = totals

                end = data["candidate_info"].get("period_end", "unknown")

                # (existing logic unchanged)
                if totals.get("Total Unitemized Reported Contributions"):
                    data["contributions"].append({
                        "Transaction_Date": end,
                        "Name": "Unitemized Contributions",
                        "Amount": totals["Total Unitemized Reported Contributions"],
                        "Transaction_Type": "Contribution",
                        "Source": pdf_path.split("\\")[-1]
                    })

                if totals.get("Total Unitemized Reported Expenditures"):
                    data["expenditures"].append({
                        "Transaction_Date": end,
                        "Name": "Unitemized Expenditures",
                        "Amount": totals["Total Unitemized Reported Expenditures"],
                        "Transaction_Type": "Expenditure",
                        "Source": pdf_path.split("\\")[-1]
                    })

            # ITEMIZED TOTALS PAGE
            elif page_num == 2:
                for p in tables:
                    for row in p:
                        for cell in row:
                            if cell and "SCHEDULE A1" in cell:
                                itemized_contrib_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Contributions"] = itemized_contrib_total
                            elif cell and "SCHEDULE A2" in cell:
                                itemized_in_kind_contribution_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported In Kind Contributions"] = itemized_in_kind_contribution_total
                            elif cell and "SCHEDULE B" in cell:
                                itemized_pledged_contributions = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Pledged Contributions"] = itemized_pledged_contributions
                            elif cell and "SCHEDULE E" in cell:
                                itemized_loans_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Loans"] = itemized_loans_total
                            elif cell and "SCHEDULE F1" in cell:
                                itemized_expend_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Expenditures"] = itemized_expend_total
                            elif cell and "SCHEDULE F2" in cell:
                                itemized_unpaid_incurred_obligations_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Unpaid Incurred Obligations"] = itemized_unpaid_incurred_obligations_total
                            elif cell and "SCHEDULE F3" in cell:
                                itemized_purchase_of_investments_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Purchase of Investments Made From Political Contributions"] = itemized_purchase_of_investments_total
                            elif cell and "SCHEDULE F4" in cell:
                                itemized_credit_card_expenditures_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Credit Card Expenditures"] = itemized_credit_card_expenditures_total
                            elif cell and "SCHEDULE G" in cell:
                                itemized_personal_funds_expenditures_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Expenditures Made From Personal Funds"] = itemized_personal_funds_expenditures_total
                            elif cell and "SCHEDULE H" in cell:
                                itemized_payments_to_business_of_candidate_officeholder_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Payments Made From Political Contributions to a Business of the Candidate/Officeholder"] = itemized_payments_to_business_of_candidate_officeholder_total
                            elif cell and "SCHEDULE I" in cell:
                                itemized_non_political_expenditures_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Non-Political Expenditures Made from Political Contributions"] = itemized_non_political_expenditures_total
                            elif cell and "SCHEDULE K" in cell:
                                itemized_interest_credits_gains_refunds_contributions_returned_to_filer_total = float(row[-1].replace("$","").replace(",",""))
                                data["candidate_info"]["report_totals"]["Total Itemized Reported Interest, Credits, Gains, Refunds, and Contributions Returned to Filer"] = itemized_interest_credits_gains_refunds_contributions_returned_to_filer_total

            # ---------------- SCHEDULE ROUTING ----------------
            for table in tables:

                if "SCHEDULE G" in page_title:
                    for i in range(len(table)):
                        if table[i] and "Payee name" in str(table[i]):
                            record = parse_schedule_g_record(table[i:i+3], page_num, pdf_path)
                            if record:
                                data["personal_funds_expenditures"].append(record)

                elif "F1" in page_title:
                    for i in range(len(table)-4):
                        if table[i] and "Payee name" in str(table[i]):
                            rec = parse_expenditure_record(table[i:i+5], page_num)
                            if rec:
                                data["expenditures"].append(rec)

                elif "A1" in page_title:
                    for i in range(len(table)-1):
                        rec = parse_contribution_record(table[i], table[i+1], page_num)
                        if rec:
                            data["contributions"].append(rec)
    return data


# ---------------- BATCH PROCESSING ----------------
def process_pdfs_from_links(related_tec_docs_filename, output_dir=f"downloaded_pdfs_{FIRST_NAME_CONFIG}_{LAST_NAME_CONFIG}"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    links = []
    if os.path.exists(related_tec_docs_filename):
        with open(related_tec_docs_filename, "r") as file:
            links = [line.strip() for line in file]

    for link in links:
        pdf_path = download_pdf(link, output_dir)
        if not pdf_path:
            continue

        data = extract_finance_data_from_table(pdf_path)

        data["candidate_info"]["data_source"] = link

        if LAST_NAME_CONFIG.lower() not in data["candidate_info"]["last_name"].lower():
            print("Skipping due to name mismatch")
            continue

        total_contrib = sum(x["Amount"] for x in data["contributions"])
        total_exp = sum(x["Amount"] for x in data["expenditures"])
        total_personal_funds_exp = sum(x["Amount"] for x in data["personal_funds_expenditures"])


        data["candidate_info"]["report_totals"]["Total Parsed Contributions"] = round(total_contrib, 2)
        data["candidate_info"]["report_totals"]["Total Parsed Expenditures"] = round(total_exp, 2)
        data["candidate_info"]["report_totals"]["Total Parsed Personal Funds Expenditures"] = round(total_personal_funds_exp, 2)

        out_name = f"{data['candidate_info']['last_name']}_parsed.json"

        with open(out_name, "w") as f:
            json.dump(data, f, indent=4)


def extract_supplemental_finance_data_from_table(pdf_path):
    data = {
            "candidate_info": {},
            "contributions": [],
            "expenditures": [],
            "in_kind_contributions": [],
            "personal_funds_expenditures": [],
            "credit_card_expenditures": [],
            "investment_purchases": [],
            "interest_gained": [],
            "loans": [],
        }

    def extract_office(flat_text):
        pattern = r"OFFICE\s*SOUGHT\s*\(if known\)\s*([A-Za-z]+\s*District\s*\d+)"
        match = re.search(pattern, flat_text)

        if match:
            office_sought = match.group(1).strip()
            return office_sought
        else:
            return "Not Found"
    
    def extract_first_name(data):
        flat_text = " ".join(filter(None, [str(item) for sublist in data for item in sublist]))
        flat_text = flat_text.replace("MI", "")
        first_name_pattern = r'FIRST\s+([\w]+)'
        match = re.search(first_name_pattern, flat_text)
        return match.group(1) if match else None

    def extract_last_name(data):
        last_name = None
        flattened_data = [str(item) for sublist in data for item in sublist if isinstance(item, str)]
        last_name_pattern = re.compile(r"(NICKNAME LAST SUFFIX|LAST|NICKNAME LAST)\s*.*?\n([A-Za-z]+)")

        for line in flattened_data:
            match = last_name_pattern.search(line)
            if match:
                last_name = match.group(2)
                break
        
        return last_name
    
    # Function to extract financial data
    def extract_financial_data(flat_text):
        patterns = {
            "TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED": r"TOTALOFFICEHOLDERCONTRIBUTIONSOF\$50ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL OFFICEHOLDER CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)": r"ESOFLOANS\)\$([\d,]+\.\d{2})",
            "TOTAL OFFICEHOLDER EXPENDITURES OF $100 OR LESS, UNLESS ITEMIZED": r"TOTALOFFICEHOLDEREXPENDITURESOF\$100ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL OFFICEHOLDER EXPENDITURES": r"TOTALOFFICEHOLDEREXPENDITURES\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED": r"TOTALPOLITICALCONTRIBUTIONSOF\$50ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)": r"TOTALPOLITICALCONTRIBUTIONS\(OTHERTHANPLEDGES,LOANS,ORGUARANTEESOFLOANS\)\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED": r"TOTALPOLITICALEXPENDITURESOF\$100ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL EXPENDITURES": r"TOTALPOLITICALEXPENDITURES\$([\d,]+\.\d{2})"
        }

        # Extract and store values in a dictionary
        results = {}

        for header, pattern in patterns.items():
            match = re.search(pattern, flat_text)
            if match:
                # Extract and clean the value
                value = match.group(1).replace(",", "").strip()
                results[header] = float(value)
            else:
                results[header] = 0.00

        return results

    def extract_period_covered(flattened_text):
        try:
            pattern_start = r"PERIOD/COVERED.*?(\d{1,2}/\d{1,2}/\d{4})"
            pattern_end = r"\s*THROUGH\s*(\d{1,2}/\d{1,2}/\d{4})"

            match_start = re.search(pattern_start, flattened_text, re.IGNORECASE).group(1)
            match_end = re.search(pattern_end, flattened_text, re.IGNORECASE).group(1)

            if match_start and match_end:
                start_date = match_start
                end_date = match_end

                start_date = datetime.strptime(start_date, "%m/%d/%Y").strftime("%Y-%m-%d")
                end_date = datetime.strptime(end_date, "%m/%d/%Y").strftime("%Y-%m-%d")
                return start_date, end_date
            else:
                return None  # Return None if no match is found
        except Exception as e:
            print(f"Error extracting period covered: {e}")
            return None


    def parse_header_page(table):
        header = {}
        flat_text = " ".join(filter(None, [str(item) for sublist in table for item in sublist])).replace("None", "").replace(" ", "").replace("\n","")
        start, end = extract_period_covered(flat_text)
        header["candidate_info"] = {
            "first_name": extract_first_name(table),
            "last_name": extract_last_name(table),
            "office_sought": extract_office(flat_text),
            "report_totals" : extract_financial_data(flat_text),
            "period_start": start,
            "period_end": end
        }

        return header

    def parse_contribution_record(row, next_row, page_num):
        try:
            date_and_type = row[0].split("\n")
            date = date_and_type[1]
            date = datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d")

            transaction_type = " ".join(date_and_type[2:])

            donor_name_and_address = row[1].split("\n")
            donor_name = donor_name_and_address[1]
            address = donor_name_and_address[-1]

            amount = float(row[-1].split("\n")[-1])

            occupation = parseOccupation(next_row)
            employer = parseEmployer(next_row)

            if not transaction_type:
                officeholder_contributions_total = round(data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"])
                campaign_contributions_total = round(data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"])
                if officeholder_contributions_total != 0 and campaign_contributions_total == 0:
                    transaction_type = "Campaign Contribution"
                elif officeholder_contributions_total == 0 and campaign_contributions_total != 0:
                    transaction_type = "Officeholder Contribution"
                
            if date and donor_name and address and amount:
                return {
                    "Transaction_Date": date,
                    "Name": donor_name,
                    "Address": address,
                    "Occupation": occupation,
                    "Employer": employer,
                    "Amount": float(amount),
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename,
                    "Schedule": "A1",
                    "Page" : page_num
                }
            return None
        except Exception as e:
            # print(e)
            return None

    def extract_amount_and_description(text):
        try:
            # Pattern to extract the first number after "description"
            amount_pattern = r"description\s*([\d,]+\.\d{2})"
            amount_match = re.search(amount_pattern, text)
            amount = float(amount_match.group(1)) if amount_match else None

            # Pattern to extract the text following the number until "Check if travel outside of Texas"
            if amount_match:
                description_pattern = rf"{re.escape(amount_match.group(1))}\s+(.*?)\s+Check if travel outside of Texas"
                description_match = re.search(description_pattern, text)
                description = description_match.group(1).strip() if description_match else None
            else:
                description = None

            return amount, description
        except Exception as e:
            print(f"Error in extract_amount_and_description: {e}")
            return None, None


    def parse_in_kind_contribution(table):
        try:
            results = []  # Initialize as a list to store the parsed records
            for row in table:
                # Initialize fields as None
                date, name, address, amount, description_line = None, None, None, None, None

                # Extract Date
                if row[0] and "Date" in row[0]:
                    date = row[0].split("\n")[1].strip()
                    date =  datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d"),


                # Extract Contributor Name and Address
                if row[1] and "Full name of contributor" in row[1]:
                    lines = row[1].split("\n")
                    name = lines[1].strip()  # Extract Name
                    address = lines[-1].strip()  # Extract Address

                # Extract Amount and In-kind Contribution Description
                if row[-1] and "Amount of" in row[-1]:
                    lines = " ".join(row[-1].split("\n")).replace("○", "")  # Clean up text
                    amount, description_line = extract_amount_and_description(lines)

                # Append to results if all fields are non-None
                if date and name and address and amount and description_line:
                    results.append({
                        "Date": date,
                        "Name": name,
                        "Address": address,
                        "Amount": amount,
                        "Description": description_line,
                        "Source" : source_filename
                    })

            return results

        except Exception as e:
            #print(f"Error parsing table: {e}")
            return results

    def parse_credit_card_record(table, page_num, pdf_path):
        try:
            tokens = []
            for row in table:
                for cell in row:
                    if cell:
                        tokens.extend(cell.split("\n"))

            tokens = [t.strip() for t in tokens if t.strip()]

            raw_tokens = " ".join(tokens)
            date = table[0][0].split("\n")[1]
            date = datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d")

            payee_name = table[0][1].split("\n")[1]

            amount = table[1][0].split("\n")[0].split("Amount ($) ")[-1].strip()
            amount = float(amount.replace(",", "")) if amount else None

            address = table[1][1].split("\n")[-1]

            category = table[3][1].split("\n")[1] if len(table) > 3 and table[3][1] else None

            description = table[3][2].split("\n")[-1] if len(table) > 3 and table[3][2] else None

            transaction_type = extract_transaction_type(raw_tokens, "Credit Card Expenditure")
            if date and payee_name and address and amount:
                return {
                    "Transaction_Date": date,
                    "Name": payee_name,
                    "Address": address,
                    "Amount": amount,
                    "Category": category,
                    "Description": description,
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename,
                    "Schedule": "F4",
                    "Page" : page_num
                }
            return None
        except Exception as e:
            print(f"Schedule F4 parse error: {e}")
            return None

    def parse_interest_record(table, page_num):
        try:
            tokens = []
            for row in table:
                for cell in row:
                    if cell:
                        tokens.extend(cell.split("\n"))

            tokens = [t.strip() for t in tokens if t.strip()]

            raw_tokens = " ".join(tokens)
            transaction_date = table[0][0].split("\n")[1]
            transaction_date = datetime.strptime(transaction_date, "%m/%d/%Y").strftime("%Y-%m-%d")

            name = table[0][1].split("\n")[1]

            address = table[0][1].split("\n")[-1]

            amount = table[0][3].split("\n")[-1].strip()
            amount = float(amount.replace(",", "")) if amount else None

            description = table[1][1].split("\n")[-1] if len(table) > 1 and table[1][1] else None

            transaction_type = extract_transaction_type(raw_tokens, "Interest, Credits, Gains, Refunds, and Contributions Returned to Filer")

            if transaction_date and name and address and amount:
                return {
                    "Transaction_Date": transaction_date,
                    "Name": name,
                    "Address": address,
                    "Amount": amount,
                    "Description": description,
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename,
                    "Schedule": "K",
                    "Page" : page_num
                }
            return None
        except Exception as e:
            print(f"Error parsing interest record: {e}")

    def parse_investment_record(table, page_num, pdf_path):
        try:
            tokens = []
            for row in table:
                for cell in row:
                    if cell:
                        tokens.extend(cell.split("\n"))

            tokens = [t.strip() for t in tokens if t.strip()]

            raw_tokens = " ".join(tokens)

            transaction_date = table[0][0].split("\n")[1]
            transaction_date = datetime.strptime(transaction_date, "%m/%d/%Y").strftime("%Y-%m-%d")
            name = table[0][1].split("\n")[1]
            address = table[0][1].split("\n")[-1]
            description = table[1][1].split("\n")[-1] if len(table) > 1 and table[1][1] else None
            amount = table[2][1].split("\n")[-1].strip()
            amount = float(amount.replace(",", "")) if amount else None
            transaction_type = extract_transaction_type(raw_tokens, "Investment Purchase")
            if transaction_date and name and address and amount:
                return {
                    "Transaction_Date": transaction_date,
                    "Name": name,
                    "Address": address,
                    "Amount": amount,
                    "Description": description,
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename,
                    "Schedule": "F3",
                    "Page" : page_num
                }
            return None
        except Exception as e:
            print(f"Error parsing investment record: {e}")
    def parse_loan_record(table, page_num):
        try:
            print(table)
            tokens = []
            for row in table:
                for cell in row:
                    if cell:
                        tokens.extend(cell.split("\n"))

            tokens = [t.strip() for t in tokens if t.strip()]

            raw_tokens = " ".join(tokens)

            transaction_date = table[0][0].split("\n")[-1]
            transaction_date = datetime.strptime(transaction_date, "%m/%d/%Y").strftime("%Y-%m-%d")
            name = table[0][1].split("\n")[1]
            address = table[0][1].split("\n")[-1]
            amount = table[0][3].split("\n")[1].strip()
            amount = float(amount.replace(",", "")) if amount else None
            transaction_type = extract_transaction_type(raw_tokens, "Loan")
            interest_rate = table[1][-1].split("\n")[-1] if len(table) > 1 and table[1][-1] else None
            cleaned_interest_rate = float(re.sub(r'[^0-9.]', '', interest_rate)) if interest_rate else None
            print(f"Cleaned Interest Rate: {cleaned_interest_rate}\nInterest Rate: {interest_rate}")
            print(f"Table: {table[1][-1]}")
            if transaction_date and name and address and amount:
                return {
                    "Transaction_Date": transaction_date,
                    "Name": name,   
                    "Address": address,
                    "Amount": amount,
                    "Interest_Rate": cleaned_interest_rate,
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename,
                    "Schedule": "E",
                    "Page" : page_num
                }
            return None
        except Exception as e:
            print(f"Error parsing loan record: {e}")


    def parse_expenditure_record(record, page_num):
        try:
            # Extract date and payee name
            date_and_payee = record[0][0].split("\n")
            date = date_and_payee[1]
            date = datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d")

            payee_name = record[0][1].split("\n")[1]

            # Extract amount and transaction type
            amount_data = record[1][0]
            transaction_type = " ".join(amount_data.split("\n")[2:])
            
            # Match the monetary value (handles both formats)
            match = re.search(r'\d+(?:,\d{3})*(?:\.\d{2})', amount_data)
            amount = round(float(match.group().replace(",", "")),2) if match else None

            # Extract payee address
            payee_address = record[1][1].split("\n")[-1]

            # Extract category and description
            category_data = record[2][1].split("\n")
            category = category_data[1] if len(category_data) > 1 else None
            description = record[2][2].split("\n")[-1] if record[2][2] else None

            # Return the parsed record
            if date and payee_name and amount and payee_address and category and description:
                return {
                    "Transaction_Date": date,
                    "Name": payee_name,
                    "Address": payee_address,
                    "Amount": amount,
                    "Transaction_Type": transaction_type,
                    "Category": category,
                    "Description": description,
                    "Source": source_filename,
                    "Schedule": "F1",
                    "Page": page_num
                }
            return None
        except Exception as e:
            # For debugging purposes
            #print(f"Error parsing record: {e}")
            return None


    with pdfplumber.open(pdf_path) as pdf:
        source_filename = pdf_path.split("\\")[-1]
        for page_num, page in enumerate(pdf.pages):
            page_title = "".join(page.extract_tables()[0][0][0])
            tables = page.extract_tables()
            if page_num == 0:
                header = parse_header_page(tables[0])
                if header:
                    data["candidate_info"] = header["candidate_info"]
                    
            for table in tables:
                if "A1" in page_title:
                    for i in range(len(table)-1):
                        record = parse_contribution_record(table[i], table[i+1], page_num)
                        if record:
                            data["contributions"].append(record)

                elif "F1" in page_title:
                    # Extract expenditure records
                    for i in range(len(table) - 4):
                        if (
                            table[i] 
                            and len(table[i]) > 1
                            and table[i][0] 
                            and isinstance(table[i][0], str) 
                            and "Date" in table[i][0]
                            and table[i][1] 
                            and isinstance(table[i][1], str)
                            and "Payee name" in table[i][1]
                        ):                        
                            expenditure_record = parse_expenditure_record(table[i:i + 5], page_num)
                            if expenditure_record:
                                data["expenditures"].append(expenditure_record)
                    
                elif "A2" in page_title:
                    in_kind_contribution = parse_in_kind_contribution(table)
                    if in_kind_contribution:
                        data["in_kind_contributions"].extend(in_kind_contribution)
                elif "SCHEDULE E" in page_title:
                    for i in range(len(table)):
                        if table[i] and "Name of lender" in str(table[i]):
                            record = parse_loan_record(table[i:i+5], page_num)
                            if record:
                                data["loans"].append(record)
                elif "SCHEDULE G" in page_title:
                    for i in range(len(table)):
                        if table[i] and "Payee name" in str(table[i]):
                            record = parse_schedule_g_record(table[i:i+3], page_num, pdf_path)
                            if record:
                                data["personal_funds_expenditures"].append(record)

                elif "SCHEDULE F3" in page_title:
                    for i in range(len(table)):
                        if table[i] and "Name of person" in str(table[i]):
                            record = parse_investment_record(table[i:i+4], page_num, pdf_path)
                            if record:
                                data["investment_purchases"].append(record)

                elif "SCHEDULE K" in page_title:
                    for i in range(len(table)):
                        if table[i] and "Name of person" in str(table[i]):
                            record = parse_interest_record(table[i:i+3], page_num)
                            if record:
                                data["interest_gained"].append(record)

                elif "SCHEDULE F4" in page_title:
                    for i in range(len(table)):
                        if table[i] and "Payee name" in str(table[i]):
                            record = parse_credit_card_record(table[i:i+4], page_num, pdf_path)
                            if record:
                                data["credit_card_expenditures"].append(record)


    return data

def parse_single_coh_pdf(pdf_path: str):
    return extract_finance_data_from_table(pdf_path)

def parse_single_supplemental_pdf(pdf_path: str):
    return extract_supplemental_finance_data_from_table(pdf_path)

if __name__ == "__main__":
    process_pdfs_from_links(related_tec_docs_filename)