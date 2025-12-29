"""
Extract questions from GMAT Practice QR PDF files.

This script processes raw_questions_*.pdf files and extracts:
- Question numbers
- Question text
- Multiple choice options (a-e)
- Tables (if present)
- Mathematical notation (LaTeX)

Output: JSON files in extracted/ directory
"""

import pdfplumber
import re
import json
import os
from pathlib import Path


class QuestionExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.pdf = pdfplumber.open(pdf_path)
        self.questions = []

    def extract_question_number(self, text):
        """Extract question number from text like '12.' or 'Question 12'"""
        # Match patterns like "12." or "Question 12" at start of line
        match = re.search(r'^\s*(\d+)\.', text, re.MULTILINE)
        return int(match.group(1)) if match else None

    def detect_table(self, page):
        """Detect if page contains table data"""
        try:
            tables = page.extract_tables()
            if tables and len(tables) > 0 and len(tables[0]) > 1:
                return self.convert_table_to_structure(tables[0])
        except Exception as e:
            print(f"  Warning: Table extraction error: {e}")
        return None

    def convert_table_to_structure(self, table):
        """Convert pdfplumber table to our format"""
        if not table or len(table) < 2:
            return None

        # Clean table data - remove None values
        cleaned_table = []
        for row in table:
            cleaned_row = [str(cell).strip() if cell else "" for cell in row]
            # Skip empty rows
            if any(cell for cell in cleaned_row):
                cleaned_table.append(cleaned_row)

        if len(cleaned_table) < 2:
            return None

        return {
            "column_headers": cleaned_table[0],  # First row as headers
            "table_data": cleaned_table[1:]       # Remaining rows as data
        }

    def extract_latex(self, text):
        """Preserve and convert LaTeX to double-escaped format"""
        if not text:
            return ""

        # Pattern to detect LaTeX-like notation
        # Look for fractions, exponents, special symbols, etc.

        # Convert common patterns to LaTeX if not already wrapped
        # Fractions like "3/4" → "$\\frac{3}{4}$"
        text = re.sub(r'(\d+)/(\d+)(?!\d)', r'$\\frac{\1}{\2}$', text)

        # Exponents like "x^2" → "$x^2$"
        text = re.sub(r'([a-zA-Z])(\^)(\d+)', r'$\1^{\3}$', text)

        # Already existing LaTeX: convert single backslash to double
        # This handles cases where LaTeX is already in the PDF
        text = re.sub(r'\\([a-zA-Z]+)', r'\\\\\\1', text)

        return text

    def extract_options(self, text, question_num):
        """Extract multiple choice options a-e"""
        options = {}

        # Pattern to match options like "A. text" or "(A) text"
        # More flexible pattern to handle various formats
        patterns = [
            (r'A\.?\s*(.+?)(?=\s*[B\(B]|$)', 'a'),
            (r'B\.?\s*(.+?)(?=\s*[C\(C]|$)', 'b'),
            (r'C\.?\s*(.+?)(?=\s*[D\(D]|$)', 'c'),
            (r'D\.?\s*(.+?)(?=\s*[E\(E]|$)', 'd'),
            (r'E\.?\s*(.+?)(?=\s*\d+\.|$)', 'e'),
        ]

        for pattern, key in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                option_text = match.group(1).strip()
                # Clean up the text
                option_text = re.sub(r'\s+', ' ', option_text)
                options[key] = self.extract_latex(option_text)

        # Verify we got all 5 options
        if len(options) != 5:
            print(f"  Warning: Question {question_num} has {len(options)} options (expected 5)")

        return options if len(options) == 5 else None

    def extract_question_text(self, text, question_num):
        """Extract main question text (before options)"""
        # Find text after question number and before first option
        pattern = r'^\s*' + str(question_num) + r'\.?\s*(.+?)(?=\s*[A\(A]\.|\s*A\s+\d|$)'
        match = re.search(pattern, text, re.DOTALL)

        if match:
            question_text = match.group(1).strip()
            # Clean up whitespace
            question_text = re.sub(r'\s+', ' ', question_text)
            return self.extract_latex(question_text)

        return ""

    def extract_questions_from_pdf(self):
        """Main extraction loop"""
        print(f"\nProcessing: {os.path.basename(self.pdf_path)}")
        current_question = None
        current_page_text = ""

        for page_num, page in enumerate(self.pdf.pages):
            text = page.extract_text()
            if not text:
                continue

            current_page_text += "\n" + text

            # Check for new question numbers
            question_numbers = re.findall(r'^\s*(\d+)\.', text, re.MULTILINE)

            for q_num_str in question_numbers:
                q_num = int(q_num_str)

                # Save previous question
                if current_question and current_question.get("question_number"):
                    self.questions.append(current_question)
                    print(f"  Extracted Q{current_question['question_number']}")

                # Start new question
                current_question = {
                    "question_number": q_num,
                    "question_text": "",
                    "options": {},
                    "has_table": False,
                    "has_chart": False,
                    "needs_manual_review": False
                }

            # Try to detect table on current page
            if current_question:
                table_data = self.detect_table(page)
                if table_data:
                    current_question["table_data"] = table_data["table_data"]
                    current_question["column_headers"] = table_data["column_headers"]
                    current_question["has_table"] = True
                    print(f"  Found table in Q{current_question.get('question_number', '?')}")

                # Detect chart/diagram mentions
                if any(keyword in text.lower() for keyword in ["chart", "graph", "diagram", "figure"]):
                    current_question["has_chart"] = True
                    current_question["needs_manual_review"] = True

        # After processing all pages, extract question text and options
        # This is done at the end because questions may span multiple pages
        full_text = "\n".join([page.extract_text() or "" for page in self.pdf.pages])

        for question in self.questions:
            q_num = question["question_number"]

            # Extract question text
            question["question_text"] = self.extract_question_text(full_text, q_num)

            # Extract options
            options = self.extract_options(full_text, q_num)
            if options:
                question["options"] = options
            else:
                question["needs_manual_review"] = True

        # Save last question
        if current_question and current_question.get("question_number"):
            self.questions.append(current_question)
            print(f"  Extracted Q{current_question['question_number']}")

        print(f"Total questions extracted: {len(self.questions)}")
        return self.questions

    def save_to_json(self, output_path):
        """Save extracted questions to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.questions, f, indent=2, ensure_ascii=False)
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

    # PDF files to process
    pdf_files = [
        "raw_questions_1.pdf",
        "raw_questions_2.pdf",
        "raw_questions_3.pdf",
        "raw_questions_4.pdf"
    ]

    all_questions = []

    for pdf_file in pdf_files:
        pdf_path = base_dir / pdf_file

        if not pdf_path.exists():
            print(f"Warning: {pdf_file} not found, skipping...")
            continue

        extractor = QuestionExtractor(str(pdf_path))
        questions = extractor.extract_questions_from_pdf()
        all_questions.extend(questions)

        # Save intermediate results
        base_name = pdf_file.replace('.pdf', '')
        output_path = extracted_dir / f"questions_{base_name}.json"
        extractor.save_to_json(str(output_path))
        extractor.close()

    # Save combined results
    combined_path = extracted_dir / "all_questions_raw.json"
    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*50}")
    print(f"EXTRACTION COMPLETE")
    print(f"Total questions extracted: {len(all_questions)}")
    print(f"Combined file: {combined_path}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
