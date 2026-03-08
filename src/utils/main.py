from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from geocode_dataset import geocode_dataset
from pdfParser import parse_single_pdf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

geo_cache = {}
cache_filename = os.path.join(UPLOAD_DIR, "geo_cache.json")

@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    filename = file.filename
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        parsed = parse_single_pdf(file_path)
        geocoded = geocode_dataset(geo_cache, parsed)
        with open(cache_filename, 'w') as json_file:
            json.dump(geo_cache, json_file, indent=4)
            print(f"Geocoded Cache Saved to {cache_filename}")

    finally:
        os.remove(file_path)

    return geocoded
