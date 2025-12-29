"""
Extract explanations from GMAT Practice QR answer_explanations PDFs.

This script processes answer_explanations_*.pdf files and extracts
detailed solution explanations for each question.

Output: explanations_all.json in extracted/ directory
"""

import pdfplumber
import re
import json
from pathlib import Path


class ExplanationExtractor:
    def __init__(self, pdf_paths):
        self.pdf_paths = pdf_paths
        self.explanations = {}

    def extract_latex(self, text):
        """Convert LaTeX to double-escaped format"""
        if not text:
            return ""

        # Convert single backslash to double backslash for LaTeX
        text = re.sub(r'\\([a-zA-Z]+)', r'\\\\\\1', text)

        return text

    def extract_explanations_from_pdf(self, pdf_path):
        """Extract explanations from single PDF"""
        print(f"\nProcessing: {Path(pdf_path).name}")

        pdf = pdfplumber.open(pdf_path)
        current_q_num = None
        current_explanation = []

        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')

            for line in lines:
                # Check for question number at start of line
                match = re.match(r'^\s*(\d+)\.', line)
                if match:
                    # Save previous explanation
                    if current_q_num:
                        explanation_text = ' '.join(current_explanation).strip()
                        self.explanations[current_q_num] = self.extract_latex(explanation_text)
                        print(f"  Q{current_q_num}: {len(explanation_text)} chars")

                    # Start new explanation
                    current_q_num = match.group(1)
                    # Get text after question number
                    current_explanation = [line[match.end():].strip()]
                elif current_q_num:
                    # Continue current explanation
                    current_explanation.append(line.strip())

        # Save last explanation
        if current_q_num:
            explanation_text = ' '.join(current_explanation).strip()
            self.explanations[current_q_num] = self.extract_latex(explanation_text)
            print(f"  Q{current_q_num}: {len(explanation_text)} chars")

        pdf.close()

    def extract_all(self):
        """Extract from all PDF files"""
        for pdf_path in self.pdf_paths:
            if Path(pdf_path).exists():
                self.extract_explanations_from_pdf(pdf_path)
            else:
                print(f"Warning: {Path(pdf_path).name} not found, skipping...")

        print(f"\nTotal explanations extracted: {len(self.explanations)}")
        return self.explanations

    def save_to_json(self, output_path):
        """Save explanations to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.explanations, f, indent=2, ensure_ascii=False)
        print(f"Saved to: {output_path}")


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    extracted_dir = base_dir / "extracted"
    extracted_dir.mkdir(exist_ok=True)

    # PDF files to process
    pdf_files = [
        base_dir / "answer_explanations_1.pdf",
        base_dir / "answer_explanations_2.pdf",
        base_dir / "answer_explanations_3.pdf",
        base_dir / "answer_explanations_4.pdf",
        base_dir / "answer_explanations_5.pdf",
        base_dir / "answer_explanations_6.pdf",
        base_dir / "answer_explanations_7.pdf",
        base_dir / "answer_explanations_8.pdf",
    ]

    extractor = ExplanationExtractor([str(p) for p in pdf_files])
    explanations = extractor.extract_all()

    # Save results
    output_path = extracted_dir / "explanations_all.json"
    extractor.save_to_json(str(output_path))

    print(f"\n{'='*50}")
    print(f"EXPLANATION EXTRACTION COMPLETE")
    print(f"Total explanations: {len(explanations)}")
    print(f"Output file: {output_path}")
    print(f"{'='*50}")

    # Validation check
    expected_total = 207
    if len(explanations) != expected_total:
        print(f"\nWARNING: Expected {expected_total} explanations, got {len(explanations)}")


if __name__ == "__main__":
    main()
