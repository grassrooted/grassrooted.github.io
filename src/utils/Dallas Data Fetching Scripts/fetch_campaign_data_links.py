from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Minimal script to collect document links and write them to a text file.

search_first_name_query = "Gay"
search_last_name_query = "Willis"
transaction_type_queries = ["Contributions", "Expenditures"]
start_year = "2025"
end_year = "2026"

output_data_sources_links = f"{search_first_name_query}_{search_last_name_query}_{start_year}_{end_year}.txt"

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

    # write links to file
    with open(output_data_sources_links, "w", encoding="utf-8") as f:
        for href in sorted(all_links):
            f.write(href + "\n")

    print(f"Wrote {len(all_links)} links to {output_data_sources_links}")


if __name__ == "__main__":
    collect_links()
