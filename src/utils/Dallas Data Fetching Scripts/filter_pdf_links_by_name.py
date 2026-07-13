import argparse
import os
import re
import requests
import tempfile
import pdfplumber


def check_first_name(first_name, flat_text):
    if first_name in flat_text:
        return True
    return False


def check_last_name(last_name, flat_text):
    if last_name in flat_text:
        return True
    return False


def is_valid_pdf(pdf_path, first_name, last_name):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        page_text = page.extract_text() or ""
        page_text = page_text.replace("None", "")
        if check_first_name(first_name, page_text) and check_last_name(last_name, page_text):
            return True
        return False


def download_pdf(url, output_path):
    response = requests.get(url, stream=True, timeout=30)
    response.raise_for_status()
    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    return output_path


def load_links(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


def filter_links(first_name, last_name, links):
    matching_links = set()

    with tempfile.TemporaryDirectory() as tmpdir:
        for index, link in enumerate(links, start=1):
            try:
                pdf_name = f"link_{index}.pdf"
                pdf_path = os.path.join(tmpdir, pdf_name)
                download_pdf(link, pdf_path)

                if is_valid_pdf(pdf_path, first_name, last_name):
                    matching_links.add(link)
            except Exception as exc:
                print(f"Skipping {link}: {exc}")

    return matching_links


def main():

    first_name="Paul"
    last_name="Ridley"
    links_file="Paul_Ridley_2019_2026.txt"

    links = load_links(links_file)
    matches = filter_links(first_name, last_name, links)
    output_file = f"campfin_links_{first_name}_{last_name}.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        for link in sorted(matches):
            f.write(link + "\n")
    print(f"Wrote {len(matches)} out of {len(links)} total matching link(s) to {output_file}")


if __name__ == "__main__":
    main()
