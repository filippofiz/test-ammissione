"""
Validate extracted and merged question data.

This script performs comprehensive validation checks on questions_merged.json:
- Completeness (all 207 questions present)
- LaTeX syntax validation
- Answer key consistency
- Options validation (all 5 present)
- Table structure validation
- Difficulty assignment validation

Output: validation_report.json in extracted/ directory
"""

import json
import re
from pathlib import Path


class ExtractionValidator:
    def __init__(self, merged_json_path):
        with open(merged_json_path, 'r', encoding='utf-8') as f:
            self.questions = json.load(f)
        self.errors = []
        self.warnings = []

    def validate_completeness(self):
        """Check all 207 questions present"""
        print("\nValidating completeness...")

        q_numbers = [q.get("question_number") for q in self.questions]
        expected = set(range(1, 208))  # 1-207
        actual = set(q_numbers)

        missing = expected - actual
        extra = actual - expected
        duplicates = [n for n in q_numbers if q_numbers.count(n) > 1]

        if missing:
            self.errors.append(f"Missing questions: {sorted(missing)}")
        if extra:
            self.errors.append(f"Extra questions: {sorted(extra)}")
        if duplicates:
            self.errors.append(f"Duplicate questions: {sorted(set(duplicates))}")

        # Check answers and explanations
        no_answer = [q["question_number"] for q in self.questions if not q.get("correct_answer")]
        no_explanation = [q["question_number"] for q in self.questions if not q.get("explanation")]

        if no_answer:
            self.errors.append(f"Missing answers for {len(no_answer)} questions: {no_answer[:10]}...")
        if no_explanation:
            self.warnings.append(f"Missing explanations for {len(no_explanation)} questions: {no_explanation[:10]}...")

        print(f"  Questions found: {len(self.questions)}/207")
        print(f"  With answers: {207 - len(no_answer)}/207")
        print(f"  With explanations: {207 - len(no_explanation)}/207")

    def validate_latex(self):
        """Validate LaTeX syntax"""
        print("\nValidating LaTeX...")

        latex_issues = 0

        for q in self.questions:
            q_num = q.get("question_number")
            text = q.get("question_text", "")

            # Check balanced $ signs
            if text.count('$') % 2 != 0:
                self.warnings.append(f"Q{q_num}: Unbalanced $ delimiters")
                latex_issues += 1

            # Check for single backslashes (should be double-escaped)
            single_backslash = re.findall(r'(?<!\\)\\(?!\\)(?![nrt"])', text)
            if single_backslash:
                self.warnings.append(f"Q{q_num}: May need double-escaped backslashes")
                latex_issues += 1

        print(f"  Questions with potential LaTeX issues: {latex_issues}")

    def validate_options(self):
        """Validate multiple choice options"""
        print("\nValidating options...")

        issues = 0

        for q in self.questions:
            q_num = q.get("question_number")
            options = q.get("options", {})

            # Check all 5 options present
            expected_keys = {'a', 'b', 'c', 'd', 'e'}
            actual_keys = set(options.keys())

            if actual_keys != expected_keys:
                self.errors.append(f"Q{q_num}: Missing options {expected_keys - actual_keys}")
                issues += 1

            # Check for empty values
            for key, value in options.items():
                if not value or (isinstance(value, str) and value.strip() == ""):
                    self.errors.append(f"Q{q_num}: Empty option '{key}'")
                    issues += 1

        print(f"  Questions with option issues: {issues}")

    def validate_tables(self):
        """Validate table structure"""
        print("\nValidating tables...")

        issues = 0

        for q in self.questions:
            q_num = q.get("question_number")

            if q.get("has_table"):
                table_data = q.get("table_data")
                headers = q.get("column_headers")

                if not table_data:
                    self.errors.append(f"Q{q_num}: has_table=true but no table_data")
                    issues += 1
                    continue

                if not headers:
                    self.errors.append(f"Q{q_num}: has_table=true but no column_headers")
                    issues += 1
                    continue

                # Check column count consistency
                expected_cols = len(headers)
                for i, row in enumerate(table_data):
                    if len(row) != expected_cols:
                        self.errors.append(
                            f"Q{q_num}: Row {i} has {len(row)} columns, expected {expected_cols}"
                        )
                        issues += 1

        print(f"  Questions with table issues: {issues}")

    def validate_difficulty(self):
        """Validate difficulty assignment"""
        print("\nValidating difficulty assignment...")

        issues = 0

        for q in self.questions:
            q_num = q.get("question_number")
            difficulty = q.get("difficulty")

            expected = None
            if 1 <= q_num <= 82:
                expected = "easy"
            elif 83 <= q_num <= 164:
                expected = "medium"
            elif 165 <= q_num <= 207:
                expected = "hard"

            if difficulty != expected:
                self.errors.append(
                    f"Q{q_num}: difficulty is '{difficulty}', expected '{expected}'"
                )
                issues += 1

        print(f"  Questions with difficulty issues: {issues}")

    def validate_answers(self):
        """Validate answer format"""
        print("\nValidating answers...")

        issues = 0
        valid_answers = {'a', 'b', 'c', 'd', 'e'}

        for q in self.questions:
            q_num = q.get("question_number")
            answer = q.get("correct_answer")

            if answer and answer not in valid_answers:
                self.errors.append(f"Q{q_num}: Invalid answer '{answer}' (must be a-e)")
                issues += 1

        print(f"  Questions with invalid answers: {issues}")

    def validate_all(self):
        """Run all validation checks"""
        print(f"{'='*50}")
        print("VALIDATION STARTING")
        print(f"{'='*50}")

        self.validate_completeness()
        self.validate_latex()
        self.validate_options()
        self.validate_tables()
        self.validate_difficulty()
        self.validate_answers()

        # Generate report
        report = {
            "total_questions": len(self.questions),
            "errors": self.errors,
            "warnings": self.warnings,
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
            "status": "PASS" if len(self.errors) == 0 else "FAIL",
            "validation_checks": {
                "completeness": "PASS" if not any("Missing questions" in e for e in self.errors) else "FAIL",
                "options": "PASS" if not any("option" in e.lower() for e in self.errors) else "FAIL",
                "answers": "PASS" if not any("answer" in e.lower() for e in self.errors) else "FAIL",
                "difficulty": "PASS" if not any("difficulty" in e.lower() for e in self.errors) else "FAIL",
                "tables": "PASS" if not any("table" in e.lower() for e in self.errors) else "FAIL"
            }
        }

        print(f"\n{'='*50}")
        print("VALIDATION COMPLETE")
        print(f"{'='*50}")
        print(f"Status: {report['status']}")
        print(f"Total questions: {len(self.questions)}")
        print(f"Errors: {len(self.errors)}")
        print(f"Warnings: {len(self.warnings)}")

        if self.errors:
            print(f"\nFirst 5 errors:")
            for error in self.errors[:5]:
                print(f"  - {error}")

        if self.warnings:
            print(f"\nFirst 5 warnings:")
            for warning in self.warnings[:5]:
                print(f"  - {warning}")

        print(f"{'='*50}")

        return report


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    extracted_dir = script_dir.parent / "extracted"
    merged_path = extracted_dir / "questions_merged.json"

    if not merged_path.exists():
        print(f"Error: {merged_path} not found!")
        print("Please run merge_data.py first.")
        return 1

    # Run validation
    validator = ExtractionValidator(merged_path)
    report = validator.validate_all()

    # Save report
    report_path = extracted_dir / "validation_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"\nReport saved to: {report_path}")

    # Return exit code based on status
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    exit(main())
