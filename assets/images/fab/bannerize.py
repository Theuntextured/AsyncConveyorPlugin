import os
import json
import random
from PIL import Image, ImageDraw, ImageFont

# ================= CONFIGURATION =================
# DIRECTORIES
INPUT_FOLDER = 'screenshots_raw'
OUTPUT_FOLDER = 'screenshots_labeled'
CACHE_FILE = 'labels_cache.json'   # Where we store your inputs

# VISUAL SETTINGS
POSITION = 'top_right'             # Options: 'top_right', 'top_left', 'bottom_right', 'bottom_left'
SLANT_FACTOR = 0.5                 # How slanted is the edge? (0.0 = box, 1.0 = 45 degrees)
VERTICAL_MARGIN_PERCENT = 0.05     # Move banner away from the edge (5% of image height)

# FILE SIZE SETTINGS
MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024 # 3MB limit

# COLORS
TEXT_COLOR = (17, 17, 22)          # Dark void color (#111116)
# BANNER_COLOR is now randomized per image

# DIMENSIONS
BANNER_HEIGHT_PERCENT = 0.08       # Minimum Banner height (8% of image height)
FONT_SIZE_PERCENT = 0.65           # Text size relative to the base banner height
MAX_TEXT_WIDTH_PERCENT = 0.75      # Wrap text if wider than 75% of image width
PADDING_X = 60                     # Horizontal padding inside the banner
PADDING_Y_FACTOR = 0.2             # Vertical padding factor (relative to banner height)

# FONT (Optional)
CUSTOM_FONT_PATH = "Orbitron-Regular.ttf" 
# =================================================

def get_font(size):
    if CUSTOM_FONT_PATH and os.path.exists(CUSTOM_FONT_PATH):
        return ImageFont.truetype(CUSTOM_FONT_PATH, size)
    else:
        try:
            return ImageFont.truetype("arial.ttf", size)
        except:
            return ImageFont.load_default()

def wrap_text(text, font, max_width):
    """Breaks text into multiple lines if it exceeds max_width."""
    lines = []
    words = text.split()
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = font.getbbox(test_line)
        w = bbox[2] - bbox[0]
        
        if w <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                # Word is longer than line, just add it
                lines.append(word)
                current_line = []
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return '\n'.join(lines)

def generate_pleasing_color():
    """Generates a random pastel color that is easy on the eyes."""
    # We restrict values to the upper range (160-255) to ensure lightness
    # This guarantees contrast with the dark text.
    r = random.randint(160, 255)
    g = random.randint(160, 255)
    b = random.randint(160, 255)
    return (r, g, b)

def process_images():
    # 1. Setup
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
        print(f"I created '{INPUT_FOLDER}'. Place your screenshots there, Master.")
        return

    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    # 2. Load Cache
    label_cache = {}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                label_cache = json.load(f)
            print(f"Loaded {len(label_cache)} cached labels from {CACHE_FILE}.")
        except Exception as e:
            print(f"Warning: Could not load cache: {e}")

    # 3. Find Images
    supported_formats = ('.png', '.jpg', '.jpeg', '.bmp')
    images = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(supported_formats)]

    if not images:
        print("No images found in the input folder.")
        return

    print("---------------------------------------------------------------")
    count = 0

    for filename in images:
        filepath = os.path.join(INPUT_FOLDER, filename)
        user_text = ""

        # --- GET TEXT (Cache vs Input) ---
        if filename in label_cache:
            user_text = label_cache[filename]
            print(f"[{filename}] Using cached label: '{user_text}'")
        else:
            print(f"\nProcessing: {filename}")
            user_text = input("Label? (Enter to skip): ").strip()
            
            if user_text:
                # Update Cache immediately
                label_cache[filename] = user_text
                with open(CACHE_FILE, 'w') as f:
                    json.dump(label_cache, f, indent=4)
        
        if not user_text:
            print(f"Skipping {filename}...")
            continue
        
        try:
            with Image.open(filepath).convert("RGBA") as img:
                width, height = img.size
                draw = ImageDraw.Draw(img)

                # --- CALCULATE GEOMETRY ---
                # Base sizes
                base_banner_h = int(height * BANNER_HEIGHT_PERCENT)
                font_size = int(base_banner_h * FONT_SIZE_PERCENT)
                slant_w = int(base_banner_h * SLANT_FACTOR)
                margin_y = int(height * VERTICAL_MARGIN_PERCENT)
                
                # Load Font
                font = get_font(font_size)
                
                # Wrap Text
                max_w_px = int(width * MAX_TEXT_WIDTH_PERCENT)
                wrapped_text = wrap_text(user_text, font, max_w_px)
                
                # Measure Multiline Text
                bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font, align='left')
                text_w = bbox[2] - bbox[0]
                text_h = bbox[3] - bbox[1]

                # Determine Banner Height based on text content
                padding_y = int(base_banner_h * PADDING_Y_FACTOR)
                banner_h = text_h + (padding_y * 2)
                
                # Ensure banner is at least the minimum base height
                if banner_h < base_banner_h:
                    banner_h = base_banner_h

                # Recalculate slant width based on new height (optional, keeps proportion)
                slant_w = int(banner_h * SLANT_FACTOR)
                
                # Total Banner Width
                banner_w = text_w + (PADDING_X * 2) + slant_w

                # Generate Color
                banner_color = generate_pleasing_color()

                # Determine Coordinates (Trapezoid Logic) with Vertical Margin
                points = []
                text_pos = (0, 0)

                if POSITION == 'top_right':
                    # Apply margin_y to Y coordinates
                    p1 = (width - banner_w + slant_w, margin_y)
                    p2 = (width, margin_y)
                    p3 = (width, margin_y + banner_h)
                    p4 = (width - banner_w, margin_y + banner_h)
                    points = [p1, p2, p3, p4]
                    
                    text_x = width - PADDING_X - text_w
                    text_y = margin_y + (banner_h - text_h) / 2 - bbox[1] # Center vertically
                    text_pos = (text_x, text_y)

                elif POSITION == 'top_left':
                    p1 = (0, margin_y)
                    p2 = (banner_w - slant_w, margin_y)
                    p3 = (banner_w, margin_y + banner_h)
                    p4 = (0, margin_y + banner_h)
                    points = [p1, p2, p3, p4]
                    
                    text_x = PADDING_X
                    text_y = margin_y + (banner_h - text_h) / 2 - bbox[1]
                    text_pos = (text_x, text_y)

                elif POSITION == 'bottom_right':
                    # Shift UP from bottom by margin_y
                    y_top = height - banner_h - margin_y
                    y_bottom = height - margin_y
                    
                    p1 = (width - banner_w, y_top)
                    p2 = (width, y_top)
                    p3 = (width, y_bottom)
                    p4 = (width - banner_w + slant_w, y_bottom)
                    points = [p1, p2, p3, p4]
                    
                    text_x = width - PADDING_X - text_w - (slant_w / 2)
                    text_y = y_top + (banner_h - text_h) / 2 - bbox[1]
                    text_pos = (text_x, text_y)

                elif POSITION == 'bottom_left':
                    y_top = height - banner_h - margin_y
                    y_bottom = height - margin_y
                    
                    p1 = (0, y_top)
                    p2 = (banner_w, y_top)
                    p3 = (banner_w - slant_w, y_bottom)
                    p4 = (0, y_bottom)
                    points = [p1, p2, p3, p4]
                    
                    text_x = PADDING_X
                    text_y = y_top + (banner_h - text_h) / 2 - bbox[1]
                    text_pos = (text_x, text_y)

                # --- DRAW ---
                draw.polygon(points, fill=banner_color)
                
                # Draw Text (support multiline)
                draw.multiline_text(text_pos, wrapped_text, font=font, fill=TEXT_COLOR, align='left')

                # --- SAVE AND COMPRESS ---
                # Strategy: Save RGB. If > 3MB, convert to JPG and reduce quality until it fits.
                output_path = os.path.join(OUTPUT_FOLDER, filename)
                final_img = img.convert("RGB")
                final_img.save(output_path)
                
                file_size = os.path.getsize(output_path)
                
                if file_size > MAX_FILE_SIZE_BYTES:
                    print(f" -> [WARNING] Size {file_size/1024/1024:.2f}MB exceeds 3MB. Compressing...")
                    
                    # If original was PNG, we must switch to JPG to get compression
                    if output_path.lower().endswith('.png'):
                        os.remove(output_path) # Delete the heavy PNG
                        output_path = os.path.splitext(output_path)[0] + '.jpg'
                        print(f" -> Converting to JPEG: {output_path}")

                    # Iterative Compression Loop
                    quality = 95
                    while quality > 10:
                        final_img.save(output_path, "JPEG", quality=quality)
                        current_size = os.path.getsize(output_path)
                        if current_size <= MAX_FILE_SIZE_BYTES:
                            print(f" -> [COMPRESSED] Saved at Q={quality} ({current_size/1024/1024:.2f}MB)")
                            break
                        quality -= 10
                    else:
                        print(f" -> [FAILURE] Could not compress below 3MB even at Q=10.")
                else:
                    print(f" -> Saved: {output_path} ({file_size/1024/1024:.2f}MB)")
                    
                count += 1

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

    print(f"\nJob done. {count} images labeled.")

if __name__ == "__main__":
    process_images()