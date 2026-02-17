import os
import random
import shutil

# --- CONFIGURATION ---
SOURCE_DIR = "./ham10000_data/derm12345_optimized"   # Your folder with 10,000 .webp images
TRIAL_DIR = "./ham10000_data/derm12345_subsample"        # Where the 100 samples will go
SAMPLE_SIZE = 100

def create_trial_set():
    # 1. Create the destination folder if it doesn't exist
    if not os.path.exists(TRIAL_DIR):
        os.makedirs(TRIAL_DIR)
        print(f"Created directory: {TRIAL_DIR}")

    # 2. Get a list of all .webp images in the source directory
    all_images = [f for f in os.listdir(SOURCE_DIR) if f.lower().endswith('.webp')]
    
    if len(all_images) < SAMPLE_SIZE:
        print(f"Error: Only found {len(all_images)} images. Need at least {SAMPLE_SIZE}.")
        return

    # 3. Randomly sample 100 filenames
    sampled_images = random.sample(all_images, SAMPLE_SIZE)
    print(f"Randomly selected {SAMPLE_SIZE} images.")

    # 4. Copy the sampled images to the trial folder
    for i, filename in enumerate(sampled_images):
        src_path = os.path.join(SOURCE_DIR, filename)
        dst_path = os.path.join(TRIAL_DIR, filename)
        
        shutil.copy2(src_path, dst_path) # copy2 preserves original file metadata
        
        if (i + 1) % 20 == 0:
            print(f"Copied {i + 1}/{SAMPLE_SIZE}...")

    print(f"\nTrial set ready! You can now run your Gemini script on the '{TRIAL_DIR}' folder.")

if __name__ == "__main__":
    create_trial_set()