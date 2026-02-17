import base64
import json
import os
import time
import vertexai
from vertexai.generative_models import GenerativeModel, Part

# --- CONFIGURATION ---
PROJECT_ID = "derm1-487716"
IMAGE_DIR = "./ham10000_data/derm12345_subsample"
LABELS_JSON = "./ham10000_data/derm12345_metadata.json"  # Your existing merged data
OUTPUT_JSON = "./ham10000_data/vlm_annotations_with_logic.json"

vertexai.init(project=PROJECT_ID, location="us-central1")
model = GenerativeModel("gemini-2.0-flash")

def process_with_expert_guidance():
    # Load your existing ground-truth data
    with open(LABELS_JSON, "r") as f:
        master_data = json.load(f)

    results = {}
    image_files = [f for f in os.listdir(IMAGE_DIR) if f.endswith(".webp")]

    print(f"Generating expert-guided explanations for {len(image_files)} images...")

    for i, filename in enumerate(image_files):
        img_id = filename.replace(".webp", "")
        
        # Get the ground truth for this specific image
        data = master_data.get(img_id)
        if not data:
            continue

        diagnosis = data['diagnosis']
        superclass = data['superclass']
        malignancy = data['malignancy']

        # Enhanced Prompt: Telling the model the "Answer" so it can explain the "Why"
        guided_prompt = f"""
        You are a medical data extraction engine.
        The ground-truth diagnosis for this dermoscopy image is: {diagnosis}.
        This is a {malignancy}, {superclass} lesion.
        Output ONLY the final educational annotation.
        
        [CONSTRAINTS]
        - DO NOT use conversational filler (no "Certainly", "Here is", "Okay").
        - DO NOT use markdown formatting like ```json or bolding.
        - Output MUST be a single string of text.
        
        [FORMAT]
        Describe the visual features supporting the diagnosis in 1-2 sentences. Focus on key characteristics that a clinician would look for in the image to arrive at the diagnosis of {diagnosis}. Be concise and informative.
        """

        try:
            with open(os.path.join(IMAGE_DIR, filename), "rb") as img_file:
                img_bytes = img_file.read()
            
            image_part = Part.from_data(data=img_bytes, mime_type="image/webp")
            response = model.generate_content([image_part, guided_prompt])
            
            # Store the explanation back into our data structure
            results[img_id] = {
                "explanation": response.text,
                "diagnosis": diagnosis # Keep for reference
            }
        except Exception as e:
            print(f"Error on {img_id}: {e}")

        # Save every 50 images to prevent data loss
        if i % 50 == 0:
            print(f"Processed {i}/{len(image_files)}...")
            with open(OUTPUT_JSON, "w") as f:
                json.dump(results, f, indent=2)

    # Final save
    with open(OUTPUT_JSON, "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    process_with_expert_guidance()