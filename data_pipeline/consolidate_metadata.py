import json
import os

# --- CONFIGURATION ---
ORIGINAL_DATA_FILE = "./ham10000_data/derm12345_metadata.json"  # File with diagnosis/superclass
VLM_DATA_FILE = "./ham10000_data/vlm_annotations_with_logic.json"    # File from Gemini script
MASTER_OUTPUT = "./ham10000_data/metadata_master.json"           # Final file for your web app
DEFAULT_EXPLANATION = "No VLM explanation available."

def consolidate_data():
    # 1. Load your original clinical metadata
    if not os.path.exists(ORIGINAL_DATA_FILE):
        print(f"Error: {ORIGINAL_DATA_FILE} not found.")
        return
    
    with open(ORIGINAL_DATA_FILE, 'r', encoding='utf-8') as f:
        master_dict = json.load(f)

    # 2. Load the VLM annotations
    if not os.path.exists(VLM_DATA_FILE):
        print(f"Error: {VLM_DATA_FILE} not found. Run the annotation script first.")
        return

    with open(VLM_DATA_FILE, 'r', encoding='utf-8') as f:
        vlm_dict = json.load(f)

    # This will be our new, smaller master list
    final_output_dict = {}

    print(f"Filtering master list... targeting {len(vlm_dict)} images.")

    # 3. Build the final dict using ALL keys in the master list
    for img_id, master_content in master_dict.items():
        # Create a combined record
        combined_record = master_dict[img_id].copy()
        vlm_content = vlm_dict.get(img_id, {})
            
        # Extract the explanation text
        if len(vlm_content) > 0:
            explanation = vlm_content.get("explanation", "")
        else:
            explanation = DEFAULT_EXPLANATION
            
        combined_record["vlm_explanation"] = explanation
            
        # Add to our final filtered set
        final_output_dict[img_id] = combined_record

    # 4. Save the final file
    with open(MASTER_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(final_output_dict, f, indent=2)

    print(f"Success! Created {MASTER_OUTPUT}.")
    print(f"Total images in master: {len(final_output_dict)}")

if __name__ == "__main__":
    consolidate_data()