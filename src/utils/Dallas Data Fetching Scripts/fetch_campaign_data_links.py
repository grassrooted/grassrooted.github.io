import time, re, os, pdfplumber, sys, json
"""
    Required Settings
        - First
        - Last
        - Start Year
        - End Year

    Output
        - Pairs of unique COH/Supplemental links for parsing
"""
search_first_name_query = "Jaime"
search_last_name_query = "Resendez"
start_year = "2025"
end_year = "2026"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import urlparse
from pdfParser import \
    extract_supplemental_period_covered, \
    extract_coh_period_covered, \
    download_pdf, \
    extract_coh_unitemized_reported_totals, \
    extract_supplemental_report_totals, \
    extract_supplemental_first_name, \
    extract_supplemental_last_name, \
    extract_coh_first_name, \
    extract_coh_last_name

# Minimal script to collect document links and write them to a text file.

transaction_type_queries = ["Contributions", "Expenditures"]

output_folder = "Sources"
os.makedirs(output_folder, exist_ok=True)

output_data_sources_links = f"{search_first_name_query}_{search_last_name_query}_{start_year}_{end_year}.json"

PATTERN = re.compile(r"/(tec|srp)(\d+)_", re.IGNORECASE)

def preprocess_report(url, report):
    print(f"Preprocessing URL: {url}")
    filetype = "srp" if "srp" in url else "tec"
    filename = os.path.basename(urlparse(url).path)
    pdf_path = os.path.join(output_folder, filename)

    pdf_path = download_pdf(url, output_folder)

    start, end = None, None
    firstName, lastName = None, None
    totals = {}

    if not pdf_path or not os.path.exists(pdf_path):
        print(f"Download failed: {url}")
        return None

    if os.path.getsize(pdf_path) < 100:
        print(f"Downloaded file is suspiciously small: {pdf_path}")
        return None
    # Open each PRIMARY DOCUMENT
    try:
        with pdfplumber.open(pdf_path) as pdf:
            if filetype == "tec":
                header_tables = pdf.pages[0].extract_tables()
                totals_tables = pdf.pages[1].extract_tables()
                if header_tables:
                    start, end = extract_coh_period_covered(header_tables[0])
                    firstName = extract_coh_first_name(header_tables[0])
                    lastName = extract_coh_last_name(header_tables[0])
                else:
                    print(f"Header Tables not extracted for {pdf_path}")

                if totals_tables:
                    totals = extract_coh_unitemized_reported_totals(totals_tables[0])
                else:
                    print(f"Totals Table not extracted for {pdf_path}")
            else:
                header_and_totals_table = pdf.pages[0].extract_tables()
                if header_and_totals_table:
                    start, end = extract_supplemental_period_covered(header_and_totals_table[0])
                    totals = extract_supplemental_report_totals(header_and_totals_table[0])
                    firstName = extract_supplemental_first_name(header_and_totals_table[0])
                    lastName = extract_supplemental_last_name(header_and_totals_table[0])
                else:
                    print(f"Header and Totals Table not extracted for {pdf_path}")

        # Create a copy of report and add timeline fields
        if (firstName and search_first_name_query == firstName) or (lastName and search_last_name_query == lastName):
            return {
                **report,
                "start": start,
                "end": end,
                "first": firstName,
                "last": lastName,
                **totals
            }
    except Exception as e:
        print(f"Failed to parse {pdf_path}: {e}")
        return None

def group_reports(links):
    grouped = {}

    for link in links:
        match = PATTERN.search(link)
        if not match:
            continue

        report_type = match.group(1).lower()
        report_id = match.group(2)

        if report_id not in grouped:
            grouped[report_id] = {
                "tec": None,
                "srp": None
            }

        grouped[report_id][report_type] = link

    results = []

    for report_id in sorted(grouped.keys(), key=int):
        tec = grouped[report_id]["tec"]
        srp = grouped[report_id]["srp"]

        results.append({
            "srp": srp,
            "tec": tec
        })

    return results

def select_dropdown_by_text(driver, element_id, visible_text, timeout=10):
    """
    Re-locates a dropdown every time before selecting.
    Prevents stale element exceptions caused by ASP.NET partial postbacks.
    """

    dropdown = WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((By.ID, element_id))
    )

    Select(dropdown).select_by_visible_text(visible_text)

    return dropdown

def collect_links():
    driver = webdriver.Chrome()
    all_links = set()

    try:
        for transaction_type_query in transaction_type_queries:
            driver.get("https://campfin.dallascityhall.com/search.aspx")

            # Fill search form
            last_name_box = driver.find_element(By.ID, "txtLName")
            first_name_box = driver.find_element(By.ID, "txtFName")

            last_name_box.clear()
            first_name_box.clear()
            last_name_box.send_keys(search_last_name_query)
            first_name_box.send_keys(search_first_name_query)


            # Transaction type
            select_dropdown_by_text(
                driver,
                "TranType",
                transaction_type_query
            )

            # Wait for any ASP.NET update to complete by re-finding the next dropdown
            select_dropdown_by_text(
                driver,
                "SDateYYYY",
                start_year
            )

            # Re-find AGAIN after selecting the start year
            select_dropdown_by_text(
                driver,
                "EDateYYYY",
                end_year
            )

            submit_button = driver.find_element(By.ID, "btnSearch")
            submit_button.send_keys(Keys.RETURN)

            time.sleep(4)

            seen_pages = set()
            while True:
                try:
                    results_table = driver.find_element(By.ID, "DataGrid1")
                    # collect any anchor hrefs in the table
                    anchors = results_table.find_elements(By.TAG_NAME, "a")
                    for a in anchors:
                        href = a.get_attribute("href")
                        if href and ".pdf" in href:
                            all_links.add(href)

                    # handle pagination: look for page links in last row
                    pagination_row = results_table.find_elements(By.TAG_NAME, "tr")[-1]
                    page_links = pagination_row.find_elements(By.TAG_NAME, "a")

                    next_page_found = False
                    for link in page_links:
                        text = link.text.strip()
                        if text and text not in seen_pages:
                            seen_pages.add(text)
                            # click the link by visible text
                            try:
                                link_elem = driver.find_element(By.LINK_TEXT, text)
                                link_elem.click()
                                time.sleep(3)
                                next_page_found = True
                                break
                            except Exception:
                                continue

                    if not next_page_found:
                        break
                except Exception:
                    break

    finally:
        try:
            driver.quit()
        except Exception:
            pass


    # Generate a timeline
        """        
            group srp and tec docs together by same name
            assign a primary doc >> preferred -- supplemental | fallback -- coh
        """
        grouped_reports = group_reports(all_links)
        timeline_groups = []

        for report in grouped_reports:
            # Download each PRIMARY DOCUMENT
            url = report["srp"]
            response = preprocess_report(url, report)
            if response:
                timeline_groups.append(response)
            else:
                url = report["tec"]
                response = preprocess_report(url, report)
                if response:
                    timeline_groups.append(response)
        with open(output_data_sources_links, "w") as file:
            json.dump(timeline_groups, file, indent=4)

        # Extract report totals

        # If same period covered & same report totals -- pick a primary to add to queue and record the duplicates in a field

        # if same period covered by not same report totals -- add to queue


    # Expose the queue of all PRIMARY DOCUMENTS

if __name__ == "__main__":
    collect_links()
