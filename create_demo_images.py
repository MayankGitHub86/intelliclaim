from PIL import Image, ImageDraw, ImageFont
import os

def create_demo_images():
    """Create demo images for the presentation scenarios"""
    
    # Create demo directory
    demo_dir = "../frontend/public/demo"
    os.makedirs(demo_dir, exist_ok=True)
    
    # Scenario 1: Car Damage - Minor
    def create_car_damage_image():
        img = Image.new('RGB', (800, 600), color='lightblue')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple car with damage
        # Car body
        draw.rectangle([200, 200, 600, 400], fill='blue', outline='#000080', width=3)
        
        # Car windows
        draw.rectangle([220, 220, 580, 320], fill='lightgray', outline='gray')
        
        # Damage area (red scratches on bumper)
        draw.rectangle([580, 350, 600, 400], fill='red', outline='#8B0000', width=2)
        draw.line([(580, 360), (595, 380)], fill='#8B0000', width=3)
        draw.line([(585, 355), (598, 375)], fill='#8B0000', width=3)
        
        # Add text
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        draw.text((250, 450), "Minor Rear Bumper Damage", fill='black', font=font)
        draw.text((250, 480), "Estimated Cost: $2,500", fill='green', font=font)
        
        img.save(os.path.join(demo_dir, "car-damage-minor.jpg"), "JPEG", quality=95)
    
    # Scenario 2: Water Damage
    def create_water_damage_image():
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw ceiling with water stains
        draw.rectangle([0, 0, 800, 200], fill='lightgray', outline='gray')
        
        # Water stains (brown/yellow patches)
        draw.ellipse([300, 50, 500, 150], fill='#8B4513', outline='#654321')
        draw.ellipse([320, 70, 480, 130], fill='yellow', outline='orange')
        
        # Drip marks
        for x in range(350, 450, 20):
            draw.line([(x, 150), (x, 300)], fill='#8B4513', width=3)
        
        # Floor damage
        draw.rectangle([200, 500, 600, 600], fill='#654321', outline='black')
        
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        draw.text((250, 350), "Basement Water Damage", fill='black', font=font)
        draw.text((250, 380), "Ceiling & Floor Affected", fill='red', font=font)
        draw.text((250, 410), "Estimated Cost: $15,000", fill='red', font=font)
        
        img.save(os.path.join(demo_dir, "water-damage.jpg"), "JPEG", quality=95)
    
    # Scenario 3: Medical Bill
    def create_medical_bill_image():
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Medical form background
        draw.rectangle([100, 50, 700, 550], fill='white', outline='black', width=2)
        
        # Header
        draw.rectangle([120, 70, 680, 120], fill='lightblue', outline='blue')
        
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
            small_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
        except:
            font = ImageFont.load_default()
            small_font = font
        
        draw.text((300, 85), "MEDICAL BILL", fill='black', font=font)
        
        # Form fields
        fields = [
            "Provider: Metro General Hospital",
            "Patient ID: 12345678",
            "Service Date: Sept 15, 2025",
            "Procedure: Emergency Room Visit", 
            "Diagnosis: Z51.11 - Encounter for antineoplastic chemotherapy",
            "Total Amount: $3,200.00",
            "Insurance: Policy POL-2024-HL-009876"
        ]
        
        y_pos = 150
        for field in fields:
            draw.text((130, y_pos), field, fill='black', font=small_font)
            y_pos += 30
        
        # Stamp
        draw.rectangle([550, 400, 680, 500], fill='red', outline='#8B0000', width=2)
        draw.text((580, 440), "VERIFIED", fill='white', font=font)
        
        img.save(os.path.join(demo_dir, "medical-bill.jpg"), "JPEG", quality=95)
    
    # Create all images
    create_car_damage_image()
    create_water_damage_image()
    create_medical_bill_image()
    
    print("✅ Demo images created successfully!")
    print(f"Images saved to: {demo_dir}")

if __name__ == "__main__":
    create_demo_images()
