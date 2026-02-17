import requests
import os

# --- CONFIGURATION ---
DOI = "doi:10.7910/DVN/DAXZ7P"
BASE_URL = "https://dataverse.harvard.edu/api"
API_TOKEN = ""  # Optional for public, recommended for speed
DOWNLOAD_DIR = "./ham10000_data"

if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def download_dataset():
    # 1. Get Dataset Metadata to find File IDs
    print(f"Fetching metadata for {DOI}...")
    headers = {"X-Dataverse-key": API_TOKEN} if API_TOKEN else {}
    ds_url = f"{BASE_URL}/datasets/:persistentId/?persistentId={DOI}"
    
    response = requests.get(ds_url, headers=headers)
    response.raise_for_status()
    
    files = response.json()['data']['latestVersion']['files']
    print(f"Found {len(files)} files. Starting downloads...")

    # 2. Download each file
    for file_info in files:
        file_id = file_info['dataFile']['id']
        filename = file_info['dataFile']['filename']
        file_path = os.path.join(DOWNLOAD_DIR, filename)
        
        print(f"Downloading {filename} (ID: {file_id})...")
        
        # Using the Access API to stream the file
        dl_url = f"{BASE_URL}/access/datafile/{file_id}"
        
        with requests.get(dl_url, headers=headers, stream=True) as r:
            r.raise_for_status()
            with open(file_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
    print("\nDownload complete!")

if __name__ == "__main__":
    download_dataset()