#!/usr/bin/env python3
"""
Generate a test insurance claim image for vision analysis testing
"""

from PIL import Image, ImageDraw, ImageFont
import io
import base64

def create_insurance_claim_image():
    # Create image
    width, height = 800, 1000
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    # Try to use default font
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        header_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
        text_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Title
    draw.text((200, 20), "INSURANCE CLAIM FORM", fill='black', font=title_font)
    draw.text((250, 50), "SafeGuard Insurance", fill='black', font=header_font)
    
    # Draw a line under header
    draw.line([(50, 90), (750, 90)], fill='black', width=2)
    
    # Claim Information
    y = 120
    draw.text((50, y), "CLAIM INFORMATION", fill='black', font=header_font)
    y += 30
    draw.text((50, y), "Claim Number: CLM-2025-VEH-4567", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Date of Loss: September 20, 2025", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Location: Main Street & Oak Avenue", fill='black', font=text_font)
    
    # Policy Information
    y += 50
    draw.text((50, y), "POLICY INFORMATION", fill='black', font=header_font)
    y += 30
    draw.text((50, y), "Policy Number: POL-AUTO-789123", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Policyholder: Michael Johnson", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Phone: (555) 123-4567", fill='black', font=text_font)
    
    # Vehicle Information
    y += 50
    draw.text((50, y), "VEHICLE INFORMATION", fill='black', font=header_font)
    y += 30
    draw.text((50, y), "Vehicle: 2023 Honda Accord LX", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "VIN: 1HGCV1F30NA123456", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "License: ABC-1234", fill='black', font=text_font)
    
    # Damage Information
    y += 50
    draw.text((50, y), "DAMAGE ASSESSMENT", fill='black', font=header_font)
    y += 30
    draw.text((50, y), "Type: Rear-end collision damage", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Estimated Repair Cost: $6,750.00", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Parts: $5,730 | Labor: $1,020", fill='black', font=text_font)
    
    # Description box
    y += 40
    draw.rectangle([(50, y), (750, y + 100)], outline='black', width=1)
    y += 10
    draw.text((60, y), "INCIDENT DESCRIPTION:", fill='black', font=text_font)
    y += 20
    draw.text((60, y), "Vehicle was struck from behind while stopped at", fill='black', font=text_font)
    y += 15
    draw.text((60, y), "red light. Other driver failed to stop due to", fill='black', font=text_font)
    y += 15
    draw.text((60, y), "wet road conditions. Significant rear damage.", fill='black', font=text_font)
    y += 15
    draw.text((60, y), "Police report filed: #2025-09-20-456", fill='black', font=text_font)
    
    # Status
    y += 80
    draw.text((50, y), "STATUS: APPROVED FOR PAYMENT", fill='green', font=header_font)
    y += 30
    draw.text((50, y), "Adjuster: Jennifer Smith", fill='black', font=text_font)
    y += 25
    draw.text((50, y), "Date Processed: September 22, 2025", fill='black', font=text_font)
    
    # Add a stamp-like effect
    draw.rectangle([(500, 700), (700, 780)], outline='red', width=3)
    draw.text((520, 720), "APPROVED", fill='red', font=header_font)
    draw.text((510, 745), "SEP 22 2025", fill='red', font=text_font)
    
    # Save the image
    image.save('/Users/aditya/IntelliClaim/test_claim_image.png')
    print("Test insurance claim image created: test_claim_image.png")
    
    return image

if __name__ == "__main__":
    create_insurance_claim_image()
