"""
Extract questions from GMAT Practice QR PDF files using vision-based approach.

This script converts PDFs to images and then uses manual transcription
to extract questions, options, and mathematical notation.

Output: JSON files in extracted/ directory
"""

from pdf2image import convert_from_path
import json
import os
from pathlib import Path


def convert_pdf_to_images(pdf_path, output_dir, dpi=200):
    """Convert PDF pages to images for manual transcription"""
    pdf_name = Path(pdf_path).stem
    images_dir = Path(output_dir) / "images" / pdf_name
    images_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nConverting {pdf_path} to images...")
    pages = convert_from_path(pdf_path, dpi=dpi)

    image_paths = []
    for i, page in enumerate(pages):
        image_path = images_dir / f"page_{i+1:03d}.png"
        page.save(image_path, 'PNG')
        image_paths.append(str(image_path))
        print(f"  Saved page {i+1}/{len(pages)}")

    return image_paths


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    extracted_dir = base_dir / "extracted"
    extracted_dir.mkdir(exist_ok=True)

    # PDF files to process
    pdf_files = [
        "raw_questions_1.pdf",
        "raw_questions_2.pdf",
        "raw_questions_3.pdf",
        "raw_questions_4.pdf"
    ]

    all_image_paths = {}

    for pdf_file in pdf_files:
        pdf_path = base_dir / pdf_file

        if not pdf_path.exists():
            print(f"Warning: {pdf_file} not found, skipping...")
            continue

        image_paths = convert_pdf_to_images(str(pdf_path), str(extracted_dir))
        all_image_paths[pdf_file] = image_paths

    # Save image paths mapping
    mapping_path = extracted_dir / "image_paths.json"
    with open(mapping_path, 'w', encoding='utf-8') as f:
        json.dump(all_image_paths, f, indent=2)

    print(f"\n{'='*50}")
    print("IMAGE CONVERSION COMPLETE")
    print(f"Total PDFs processed: {len(all_image_paths)}")
    print(f"Image paths saved to: {mapping_path}")
    print(f"{'='*50}")
    print("\nNext step: Manually transcribe questions from images")
    print("Images are saved in: extracted/images/")


if __name__ == "__main__":
    main()
