import json
import os

# --- CONFIG ---
DATA_FILE = "./ham10000_data/vlm_annotations_with_logic.json"

def validate_dataset():
    if not os.path.exists(DATA_FILE):
        print("❌ Error: Data file not found.")
        return

    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    total_images = len(data)
    missing_explanation = []
    empty_features = []
    low_confidence = []

    print(f"🧐 Validating {total_images} records...")

    for img_id, details in data.items():
        # 1. Check for missing or empty explanations
        explanation = details.get("vlm_explanation", "")
        if not explanation or len(explanation.strip()) < 10:
            missing_explanation.append(img_id)

        # 2. Check for empty feature lists (if you used the array schema)
        features = details.get("vlm_features", [])
        if not features:
            empty_features.append(img_id)

        # 3. Optional: Flag records where VLM confidence was low
        score = details.get("vlm_score", 1.0)
        if score < 0.5:
            low_confidence.append(f"{img_id} ({score})")

    # --- RESULTS ---
    print("-" * 30)
    if not missing_explanation and not empty_features:
        print("✅ SUCCESS: All records are complete and ready for React!")
    else:
        print(f"⚠️ FOUND {len(missing_explanation)} missing explanations.")
        print(f"⚠️ FOUND {len(empty_features)} empty feature lists.")
        
        if missing_explanation:
            print(f"Sample missing IDs: {missing_explanation[:5]}")

    if low_confidence:
        print(f"💡 Note: {len(low_confidence)} images have low VLM confidence scores.")
    print("-" * 30)

if __name__ == "__main__":
    validate_dataset()