import os
from pathlib import Path
from PIL import Image

# --- CONFIGURATION ---
SOURCE_DIR = "./ham10000_data/derm12345_train_part_2"   # Where your unzipped parts are
OUTPUT_DIR = "./ham10000_data/derm12345_optimized"   # Where the ready-to-use images go
TARGET_WIDTH = 600               # Standard size for mobile/web views
WEBP_QUALITY = 80                # 80 is a sweet spot for clinical images

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def process_images():
    # Supported extensions in the dataset
    extensions = ('.jpg', '.jpeg', '.png')
    
    # Use rglob to find all images recursively in subfolders
    image_paths = [p for p in Path(SOURCE_DIR).rglob('*') if p.suffix.lower() in extensions]
    
    print(f"Found {len(image_paths)} images. Starting optimization...")

    for i, path in enumerate(image_paths):
        try:
            with Image.open(path) as img:
                # Calculate new height to maintain aspect ratio
                w_percent = (TARGET_WIDTH / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))
                
                # Resize using high-quality LANCZOS filtering
                img_resized = img.resize((TARGET_WIDTH, h_size), Image.Resampling.LANCZOS)
                
                # Define output filename (changing extension to .webp)
                output_filename = path.stem + ".webp"
                output_path = os.path.join(OUTPUT_DIR, output_filename)
                
                # Save as WebP
                img_resized.save(output_path, "WEBP", quality=WEBP_QUALITY)
                
            if i % 500 == 0:
                print(f"Processed {i} / {len(image_paths)} images...")
                
        except Exception as e:
            print(f"Error processing {path.name}: {e}")

    print(f"\nOptimization complete! Files are located in: {OUTPUT_DIR}")

if __name__ == "__main__":
    process_images()