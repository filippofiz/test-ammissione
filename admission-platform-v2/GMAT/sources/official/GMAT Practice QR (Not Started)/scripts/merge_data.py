"""
Merge extracted questions, answer keys, and explanations.

This script combines:
- all_questions_raw.json (questions and options)
- answer_keys.json (correct answers)
- explanations_all.json (explanations)

Into a single unified file: questions_merged.json

Output: questions_merged.json in extracted/ directory
"""

import json
from pathlib import Path


class DataMerger:
    def __init__(self, questions_path, answers_path, explanations_path):
        self.questions = self.load_json(questions_path)
        self.answers = self.load_json(answers_path)
        self.explanations = self.load_json(explanations_path)

    def load_json(self, path):
        """Load JSON file"""
        print(f"Loading: {Path(path).name}")
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"  Warning: File not found, using empty data")
            return {} if path.name != "all_questions_raw.json" else []
        except json.JSONDecodeError as e:
            print(f"  Error: Invalid JSON - {e}")
            return {} if path.name != "all_questions_raw.json" else []

    def determine_difficulty(self, q_num):
        """Assign difficulty based on question number"""
        if 1 <= q_num <= 82:
            return "easy"
        elif 83 <= q_num <= 164:
            return "medium"
        elif 165 <= q_num <= 207:
            return "hard"
        return None

    def merge(self):
        """Merge all data sources"""
        print(f"\nMerging data...")
        merged = []

        for question in self.questions:
            q_num = question.get("question_number")
            if not q_num:
                print(f"  Warning: Question without number, skipping")
                continue

            q_num_str = str(q_num)

            # Get answer
            answer_info = self.answers.get(q_num_str, {})
            correct_answer = answer_info.get("answer", None)

            # Get explanation
            explanation = self.explanations.get(q_num_str, None)

            # Build merged record
            merged_question = {
                "question_number": q_num,
                "difficulty": self.determine_difficulty(q_num),
                "question_text": question.get("question_text", ""),
                "options": question.get("options", {}),
                "correct_answer": correct_answer,
                "explanation": explanation,
                "has_table": question.get("has_table", False),
                "has_chart": question.get("has_chart", False),
                "needs_manual_review": question.get("needs_manual_review", False)
            }

            # Add table data if present
            if question.get("table_data"):
                merged_question["table_data"] = question["table_data"]
                merged_question["column_headers"] = question.get("column_headers", [])
                merged_question["table_title"] = question.get("table_title", "")

            merged.append(merged_question)
            print(f"  Merged Q{q_num}: {merged_question['difficulty']}")

        # Sort by question number
        merged.sort(key=lambda x: x["question_number"])

        print(f"\nTotal merged questions: {len(merged)}")
        return merged

    def save(self, output_path):
        """Merge and save to JSON"""
        merged = self.merge()

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(merged, f, indent=2, ensure_ascii=False)

        print(f"Saved to: {output_path}")
        return merged

    def generate_report(self, merged):
        """Generate validation report"""
        total = len(merged)
        with_answers = sum(1 for q in merged if q.get("correct_answer"))
        with_explanations = sum(1 for q in merged if q.get("explanation"))
        with_options = sum(1 for q in merged if len(q.get("options", {})) == 5)
        needs_review = sum(1 for q in merged if q.get("needs_manual_review"))
        has_tables = sum(1 for q in merged if q.get("has_table"))
        has_charts = sum(1 for q in merged if q.get("has_chart"))

        # Difficulty breakdown
        easy = sum(1 for q in merged if q.get("difficulty") == "easy")
        medium = sum(1 for q in merged if q.get("difficulty") == "medium")
        hard = sum(1 for q in merged if q.get("difficulty") == "hard")

        report = {
            "total_questions": total,
            "with_answers": with_answers,
            "with_explanations": with_explanations,
            "with_5_options": with_options,
            "needs_manual_review": needs_review,
            "has_tables": has_tables,
            "has_charts": has_charts,
            "difficulty_breakdown": {
                "easy": easy,
                "medium": medium,
                "hard": hard
            },
            "missing_answers": [q["question_number"] for q in merged if not q.get("correct_answer")],
            "missing_explanations": [q["question_number"] for q in merged if not q.get("explanation")],
            "incomplete_options": [q["question_number"] for q in merged if len(q.get("options", {})) != 5]
        }

        return report


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    extracted_dir = script_dir.parent / "extracted"

    questions_path = extracted_dir / "all_questions_raw.json"
    answers_path = extracted_dir / "answer_keys.json"
    explanations_path = extracted_dir / "explanations_all.json"

    # Merge data
    merger = DataMerger(questions_path, answers_path, explanations_path)
    merged = merger.save(extracted_dir / "questions_merged.json")

    # Generate report
    report = merger.generate_report(merged)

    # Save report
    report_path = extracted_dir / "merge_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    # Print summary
    print(f"\n{'='*50}")
    print(f"MERGE COMPLETE")
    print(f"{'='*50}")
    print(f"Total questions: {report['total_questions']}")
    print(f"  - With answers: {report['with_answers']}/{report['total_questions']}")
    print(f"  - With explanations: {report['with_explanations']}/{report['total_questions']}")
    print(f"  - With 5 options: {report['with_5_options']}/{report['total_questions']}")
    print(f"  - Needs review: {report['needs_manual_review']}")
    print(f"  - Has tables: {report['has_tables']}")
    print(f"  - Has charts: {report['has_charts']}")
    print(f"\nDifficulty breakdown:")
    print(f"  - Easy: {report['difficulty_breakdown']['easy']}")
    print(f"  - Medium: {report['difficulty_breakdown']['medium']}")
    print(f"  - Hard: {report['difficulty_breakdown']['hard']}")

    if report['missing_answers']:
        print(f"\nWARNING: Missing answers for questions: {report['missing_answers'][:10]}...")
    if report['incomplete_options']:
        print(f"\nWARNING: Incomplete options for questions: {report['incomplete_options'][:10]}...")

    print(f"\nReport saved to: {report_path}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
