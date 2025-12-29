"""
Extract answer keys from GMAT Practice QR answer_key PDF.

This script processes answer_key_1.pdf and extracts the mapping
of question numbers to correct answers (a-e).

Output: answer_keys.json in extracted/ directory
"""

import pdfplumber
import re
import json
from pathlib import Path


class AnswerKeyExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.pdf = pdfplumber.open(pdf_path)
        self.answer_key = {}

    def extract_answer_key(self):
        """Extract answer key mapping question number to correct answer"""
        print(f"\nProcessing: {Path(self.pdf_path).name}")

        for page_num, page in enumerate(self.pdf.pages):
            text = page.extract_text()
            if not text:
                continue

            # Pattern to match: "1. A" or "1. (A)" or "Question 1: A"
            # More flexible to handle various formats
            matches = re.findall(r'(\d+)[\.\:\)]\s*[\(\[]?([A-Ea-e])[\)\]]?', text)

            for q_num, answer in matches:
                q_num_int = int(q_num)
                answer_lower = answer.lower()

                # Only accept valid MC answers (a-e)
                if answer_lower in ['a', 'b', 'c', 'd', 'e']:
                    self.answer_key[str(q_num_int)] = {
                        "type": "MC",
                        "answer": answer_lower
                    }
                    print(f"  Q{q_num_int}: {answer_lower}")

        print(f"Total answers extracted: {len(self.answer_key)}")
        return self.answer_key

    def save_to_json(self, output_path):
        """Save answer key to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.answer_key, f, indent=2, ensure_ascii=False)
        print(f"Saved to: {output_path}")

    def close(self):
        """Close the PDF file"""
        self.pdf.close()


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    extracted_dir = base_dir / "extracted"
    extracted_dir.mkdir(exist_ok=True)

    # Answer key PDF
    pdf_path = base_dir / "answer_key_1.pdf"

    if not pdf_path.exists():
        print(f"Error: {pdf_path} not found!")
        return

    extractor = AnswerKeyExtractor(str(pdf_path))
    answer_key = extractor.extract_answer_key()

    # Save results
    output_path = extracted_dir / "answer_keys.json"
    extractor.save_to_json(str(output_path))
    extractor.close()

    print(f"\n{'='*50}")
    print(f"ANSWER KEY EXTRACTION COMPLETE")
    print(f"Total answers: {len(answer_key)}")
    print(f"Output file: {output_path}")
    print(f"{'='*50}")

    # Validation check
    expected_total = 207
    if len(answer_key) != expected_total:
        print(f"\nWARNING: Expected {expected_total} answers, got {len(answer_key)}")


if __name__ == "__main__":
    main()
