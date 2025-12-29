"""
Generate TypeScript files from merged questions data.

This script converts questions_merged.json into three TypeScript files
split by difficulty level (easy, medium, hard).

Output: 3 .ts files in QR/ directory
"""

import json
from pathlib import Path


class TypeScriptGenerator:
    def __init__(self, merged_json_path):
        with open(merged_json_path, 'r', encoding='utf-8') as f:
            self.questions = json.load(f)

    def escape_string(self, text):
        """Escape special characters for TypeScript string"""
        if not text:
            return ""
        # Escape backslashes first
        text = str(text).replace('\\', '\\\\')
        # Escape double quotes
        text = text.replace('"', '\\"')
        # Escape newlines
        text = text.replace('\n', '\\n')
        # Escape carriage returns
        text = text.replace('\r', '')
        return text

    def get_difficulty_level(self, difficulty):
        """Map difficulty string to numeric level"""
        mapping = {"easy": 2, "medium": 3, "hard": 4}
        return mapping.get(difficulty, 2)

    def generate_question_object(self, question):
        """Generate TypeScript object for single question"""
        q_num = question["question_number"]

        # Build questionData object parts
        question_data_parts = []

        # Question text
        question_data_parts.append(f'      question_text: "{self.escape_string(question.get("question_text", ""))}"')

        # Options
        options_lines = []
        for key in ['a', 'b', 'c', 'd', 'e']:
            value = question.get("options", {}).get(key, "")
            options_lines.append(f'        {key}: "{self.escape_string(value)}"')

        question_data_parts.append("      options: {")
        question_data_parts.append(",\n".join(options_lines))
        question_data_parts.append("      }")

        # Table data if present
        if question.get("table_data"):
            table_title = question.get("table_title", "")
            column_headers = question.get("column_headers", [])
            table_data = question.get("table_data", [])

            question_data_parts.append(f'      table_title: "{self.escape_string(table_title)}"')
            question_data_parts.append(f'      column_headers: {json.dumps(column_headers)}')
            question_data_parts.append(f'      table_data: {json.dumps(table_data)}')

        # Image URL (placeholder for charts)
        if question.get("has_chart"):
            question_data_parts.append('      image_url: null  // TODO: Add chart/diagram')
        else:
            question_data_parts.append('      image_url: null')

        question_data_parts.append('      image_options: null')

        # Build full question object
        question_data_str = ",\n".join(question_data_parts)

        # Get explanation and escape it
        explanation = self.escape_string(question.get("explanation", ""))

        ts_code = f'''  {{
    id: "QR-GMAT-PQ__-{q_num:05d}",
    question_number: {q_num},
    section: "Quantitative Reasoning" as const,
    difficulty: "{question.get("difficulty", "easy")}" as const,
    difficultyLevel: {self.get_difficulty_level(question.get("difficulty", "easy"))},
    questionData: {{
{question_data_str}
    }} as QRQuestionData,
    answers: generateMCAnswers("{question.get("correct_answer", "a")}"),
    explanation: "{explanation}",
  }}'''

        return ts_code

    def generate_file_header(self, difficulty):
        """Generate TypeScript file header"""
        return f'''import {{
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
}} from "../types";

// GMAT Practice Questions - Quantitative Reasoning
// Difficulty: {difficulty.capitalize()}
// Questions {self.get_question_range(difficulty)}

export const quantitativeReasoningPQ{difficulty.capitalize()}: QuantitativeReasoningQuestion[] = [
'''

    def get_question_range(self, difficulty):
        """Get question number range for difficulty"""
        ranges = {
            "easy": "1-82",
            "medium": "83-164",
            "hard": "165-207"
        }
        return ranges.get(difficulty, "")

    def generate_file_footer(self):
        """Generate TypeScript file footer"""
        return "];\n"

    def generate_file(self, difficulty, output_path):
        """Generate complete TypeScript file for difficulty level"""
        print(f"\nGenerating {difficulty} questions...")

        # Filter questions by difficulty
        filtered = [q for q in self.questions if q.get("difficulty") == difficulty]

        if not filtered:
            print(f"  Warning: No {difficulty} questions found")
            return

        # Generate file content
        content = self.generate_file_header(difficulty)

        for i, question in enumerate(filtered):
            content += self.generate_question_object(question)
            if i < len(filtered) - 1:
                content += ","
            content += "\n"

        content += self.generate_file_footer()

        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  Generated {len(filtered)} questions")
        print(f"  Saved to: {output_path}")

    def generate_all_files(self, output_dir):
        """Generate all three TypeScript files"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        self.generate_file("easy", output_dir / "quantitative_reasoning_PQ_easy.ts")
        self.generate_file("medium", output_dir / "quantitative_reasoning_PQ_medium.ts")
        self.generate_file("hard", output_dir / "quantitative_reasoning_PQ_hard.ts")


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    extracted_dir = base_dir / "extracted"
    merged_path = extracted_dir / "questions_merged.json"

    if not merged_path.exists():
        print(f"Error: {merged_path} not found!")
        print("Please run merge_data.py first.")
        return

    # Output directory for TypeScript files
    # Navigate to the QR directory in sources/questions
    qr_dir = base_dir.parent.parent.parent / "questions" / "QR"

    print(f"Reading merged questions from: {merged_path}")
    print(f"Output directory: {qr_dir}")

    generator = TypeScriptGenerator(merged_path)
    generator.generate_all_files(qr_dir)

    print(f"\n{'='*50}")
    print(f"TYPESCRIPT GENERATION COMPLETE")
    print(f"{'='*50}")
    print(f"Files generated in: {qr_dir}")
    print(f"  - quantitative_reasoning_PQ_easy.ts")
    print(f"  - quantitative_reasoning_PQ_medium.ts")
    print(f"  - quantitative_reasoning_PQ_hard.ts")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
