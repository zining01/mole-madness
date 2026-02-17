import csv
import json

# --- CONFIGURATION ---
INPUT_FILES = ["./ham10000_data/derm12345_metadata_test.tab", "./ham10000_data/derm12345_metadata_train.tab"]
OUTPUT_JSON = "./ham10000_data/derm12345_metadata.json"

# Full Taxonomy Mapping based on your provided tree
# Format: 'code': (Full Name, Superclass, Malignancy)
TAXONOMY = {
    # Melanocytic Benign
    'acb': ('Acral Banal Compound Nevus', 'Melanocytic', 'Benign'),
    'ccb': ('Congenital Banal Compound Nevus', 'Melanocytic', 'Benign'),
    'mcb': ('Miescher Banal Compound Nevus', 'Melanocytic', 'Benign'),
    'cb':  ('Banal Compound Nevus', 'Melanocytic', 'Benign'),
    'bdb': ('Blue Banal Dermal Nevus', 'Melanocytic', 'Benign'),
    'db':  ('Banal Dermal Nevus Nevus', 'Melanocytic', 'Benign'),
    'ajb': ('Acral Banal Junctional Nevus', 'Melanocytic', 'Benign'),
    'cjb': ('Congenital Banal Junctional Nevus', 'Melanocytic', 'Benign'),
    'jb':  ('Banal Junctional Nevus', 'Melanocytic', 'Benign'),
    'acd': ('Acral Dysplastic Compound Nevus', 'Melanocytic', 'Benign'),
    'ccd': ('Congenital Dysplastic Compound Nevus', 'Melanocytic', 'Benign'),
    'cd':  ('Dysplastic Compound Nevus', 'Melanocytic', 'Benign'),
    'ajd': ('Acral Dysplastic Junctional Nevus', 'Melanocytic', 'Benign'),
    'srjd': ('Spitz/Reed Dysplastic Junctional', 'Melanocytic', 'Benign'),
    'jd':  ('Dysplastic Junctional Nevus', 'Melanocytic', 'Benign'),
    'rd':  ('Dysplastic Recurrent Nevus', 'Melanocytic', 'Benign'),
    'isl': ('Ink Spot Lentigo', 'Melanocytic', 'Benign'),
    'ls':  ('Lentigo Simplex', 'Melanocytic', 'Benign'),
    'sl':  ('Solar Lentigo', 'Melanocytic', 'Benign'),

    # Melanocytic Malignant
    'anm': ('Acral Nodular Melanoma', 'Melanocytic', 'Malignant'),
    'alm': ('Acral Lentiginious Melanoma', 'Melanocytic', 'Malignant'),
    'lm':  ('Lentigo Maligna', 'Melanocytic', 'Malignant'),
    'lmm': ('Lentigo Maligna Melanoma', 'Melanocytic', 'Malignant'),
    'mel': ('Melanoma', 'Melanocytic', 'Malignant'),

    # Non-melanocytic Benign
    'sk':   ('Seborrheic Keratosis', 'Nonmelanocytic', 'Benign'),
    'lk':   ('Lichenoid Keratosis', 'Nonmelanocytic', 'Benign'),
    'df':   ('Dermatofibroma', 'Nonmelanocytic', 'Benign'),
    'angk': ('Angiokeratoma', 'Nonmelanocytic', 'Benign'),
    'ha':   ('Hemangioma', 'Nonmelanocytic', 'Benign'),
    'la':   ('Lymphangioma', 'Nonmelanocytic', 'Benign'),
    'pg':   ('Pyogenic Granuloma', 'Nonmelanocytic', 'Benign'),
    'sa':   ('Spider Angioma', 'Nonmelanocytic', 'Benign'),

    # Non-melanocytic Indeterminate
    #Actinic keratosis is technically pre-malignant so it is classified as malignant here, but you could argue for indeterminate if you want to be more conservative
    'ak':   ('Actinic Keratosis', 'Nonmelanocytic', 'Malignant'),

    # Non-melanocytic Malignant
    'bcc':  ('Basal Cell Carcinoma', 'Nonmelanocytic', 'Malignant'),
    'bd':   ('Bowen\'s Disease', 'Nonmelanocytic', 'Malignant'),
    'ch':   ('Cutaneous Horn', 'Nonmelanocytic', 'Malignant'),
    'mpd':  ('Mammary Paget Disease', 'Nonmelanocytic', 'Malignant'),
    'scc':  ('Squamous Cell Carcinoma', 'Nonmelanocytic', 'Malignant'),
    'dfsp': ('Dermatofibrosarcoma Protuberans', 'Nonmelanocytic', 'Malignant'),
    'ks':   ('Kaposi Sarcoma', 'Nonmelanocytic', 'Malignant')
}

def merge_csv_to_json():
    image_store = {}

    for file_path in INPUT_FILES:
        print(f"Processing {file_path}...")
        with open(file_path, mode='r', encoding='utf-8-sig') as tsv_file:
            # Use DictReader with delimiter='\t' for tab-separated files
            reader = csv.DictReader(tsv_file, delimiter='\t')
            
            for row in reader:
                img_id = row['image_id']
                dx_code = row['label']
                
                # Fetch metadata from our taxonomy map
                # Defaults to "Unknown" if the code isn't in our tree
                name, superclass, malignancy = TAXONOMY.get(
                    dx_code, ("Unknown", "Unknown", "Unknown")
                )

                image_store[img_id] = {
                    "id": img_id,
                    "src": f"images/{img_id}.webp",
                    "diagnosis": name,
                    "code": dx_code,
                    "superclass": superclass,
                    "malignancy": malignancy
                }

    # Save the consolidated dictionary as JSON
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(image_store, f, indent=2)
    
    print(f"Success! {len(image_store)} records saved to {OUTPUT_JSON}")

if __name__ == "__main__":
    merge_csv_to_json()