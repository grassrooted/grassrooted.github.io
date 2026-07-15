from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from geocode_dataset import geocode_dataset
from pdfParser import parse_single_coh_pdf, parse_single_supplemental_pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

cache_filename = os.path.join(UPLOAD_DIR, "geo_cache.json")

if os.path.exists(cache_filename):
    with open(cache_filename) as f:
        geo_cache = json.load(f)
else:
    geo_cache = {}


@app.post("/extractCOH")
async def extract_coh_pdf(file: UploadFile = File(...)):
    filename = file.filename
    print(f"Received file: {filename} for COH extraction")
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed = parse_single_coh_pdf(file_path)
        print("Beginning geocoding process for COH data...")
        geocoded = geocode_dataset(geo_cache, parsed)
        with open(cache_filename, 'w') as json_file:
            json.dump(geo_cache, json_file, indent=4)
            print(f"Geocoded Cache Saved to {cache_filename}")

    finally:
        os.remove(file_path)

    return geocoded


@app.post("/extractSupplemental")
async def extract_supplemental_pdf(file: UploadFile = File(...)):
    filename = file.filename
    print(f"Received file: {filename} for Supplemental extraction")
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed = parse_single_supplemental_pdf(file_path)
        print("Beginning geocoding process for Supplemental data...")
        geocoded = geocode_dataset(geo_cache, parsed)
        with open(cache_filename, 'w') as json_file:
            json.dump(geo_cache, json_file, indent=4)
            print(f"Geocoded Cache Saved to {cache_filename}")

    finally:
        os.remove(file_path)

    return geocoded