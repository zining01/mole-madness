import base64
import json
import os
import time
import vertexai
from vertexai.generative_models import GenerationConfig, GenerativeModel, Part
from google.api_core import exceptions

# --- CONFIGURATION ---
PROJECT_ID = "derm1-487716"
# Instead of just vertexai.init(project=PROJECT_ID)
# Ensure your environment variable is set before running the script:
os.environ["GOOGLE_CLOUD_QUOTA_PROJECT"] = "derm1-487716"
vertexai.init(project=PROJECT_ID, location="us-central1")

# ---  DATA CONFIGURATION ---
# You can switch between the trial set and the full set by changing this path
# IMAGE_DIR = "./ham10000_data/derm12345_subsample"  # Your folder with the 100 trial .webp images
IMAGE_DIR = "./ham10000_data/derm12345_optimized"  # Your folder with the full 10,000 .webp images
LABELS_JSON = "./ham10000_data/derm12345_metadata.json"  # Your existing merged data
OUTPUT_JSON = "./ham10000_data/vlm_annotations_with_logic.json"

vertexai.init(project=PROJECT_ID, location="us-central1")
model = GenerativeModel("gemini-2.0-flash")

def retry_with_backoff(image_part, guided_prompt, config, max_retries=5):
    """Retries the VLM call if rate limited, doubling the wait time each time."""
    for i in range(max_retries):
        try:
            return model.generate_content([image_part, guided_prompt], generation_config=config)
        except exceptions.ResourceExhausted:
            wait_time = (2 ** i) + 2  # Exponential wait: 3s, 4s, 6s, 10s...
            print(f"⚠️ Rate limit hit. Sleeping for {wait_time} seconds...")
            time.sleep(wait_time)
        except Exception as e:
            print(f"❌ Permanent error: {e}")
            raise e
    return None

def process_with_expert_guidance():

    # 1. Load existing progress if the file exists
    results = {}
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, "r") as f:
                results = json.load(f)
            print(f"🔄 Resuming session: Found {len(results)} existing annotations.")
        except Exception:
            print("Starting a fresh session.")

    with open(LABELS_JSON, "r") as f:
        master_data = json.load(f)

    # 2. Get list of all images and filter out already processed ones
    # Load your existing ground-truth data
    with open(LABELS_JSON, "r") as f:
        master_data = json.load(f)

    image_files = [f for f in os.listdir(IMAGE_DIR) if f.endswith(".webp")]
    print(f"Target: {len(image_files)} images total.")

    # Define the JSON structure we want
    # This is the "Constrained Decoding" configuration
    generation_config = GenerationConfig(
        response_mime_type="application/json",
        response_schema={
            "type": "OBJECT",
            "properties": {
                "explanation": {"type": "STRING"},
                "confidence_score": {"type": "NUMBER"},
                "key_features": {"type": "ARRAY", "items": {"type": "STRING"}}
            },
            "required": ["explanation"]
        },
    )

    for i, filename in enumerate(image_files):
        img_id = filename.replace(".webp", "")
        
        # Get the ground truth for this specific image
        data = master_data.get(img_id)
        if not data:
            continue

        # RESUME CHECK: Skip this image if we already have it in our results
        if img_id in results:
            continue

        diagnosis = data['diagnosis']
        superclass = data['superclass']
        malignancy = data['malignancy']

        # Prompt modified to ask for clinical justification
        guided_prompt = f"""
        Act as a dermatologist while describing this dermoscopy image. 
        Diagnosis: {diagnosis} ({malignancy}, {superclass}).
        Provide a JSON object containing:
        'explanation': A 1-2 sentence concise clinical justification using reasoning from the two-step algorithm. If possible, provide references specific visual features of this lesion (e.g., "irregular borders", "multiple colors", "blue-white veil").

        [CONSTRAINTS]
        - DO NOT use conversational filler (no "Certainly", "Here is", "Okay").
        - DO NOT use the phrase "two-step algorithm" in the explanation. Instead, directly apply the reasoning process to this specific case.
        - The explanation should be specific to the image's diagnosis and features, not a generic description of the algorithm.
        - DO NOT use the term dermoscopy in the explanation, but you can reference specific visual features that are commonly evaluated in dermoscopy.
        - DO NOT include any information that is not visually evident in the image.
        """

        try:
            with open(os.path.join(IMAGE_DIR, filename), "rb") as img_file:
                img_bytes = img_file.read()
            
            image_part = Part.from_data(data=img_bytes, mime_type="image/webp")
            
            # Use the generation_config here to force JSON output
            # response = model.generate_content(
            #     [image_part, guided_prompt],
            #     generation_config=generation_config
            # )
            # Calling our new backoff function instead of model directly
            response = retry_with_backoff(image_part, guided_prompt, generation_config)
            
            # Parse the string response into a real Python dictionary
            vlm_data = json.loads(response.text)
            
            # Merge with existing metadata
            results[img_id] = {
                **data, # Keep all original metadata
                "explanation": vlm_data.get("explanation"),
                # "vlm_features": vlm_data.get("key_features"),
                # "vlm_score": vlm_data.get("confidence_score")
            }

        except Exception as e:
            print(f"Error on {img_id}: {e}")

        if i % 50 == 0:
            print(f"Processed {i}/{len(image_files)}...")
            with open(OUTPUT_JSON, "w") as f:
                json.dump(results, f, indent=2)

    with open(OUTPUT_JSON, "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    process_with_expert_guidance()