import json
import os

# Read the questions and explanations
with open('questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

with open('explanation.json', 'r', encoding='utf-8') as f:
    explanations = json.load(f)

# Create a map of question_number to explanation
explanation_map = {exp['question_number']: exp['explanation'] for exp in explanations}

# Split questions by difficulty
easy_questions = [q for q in questions if q['difficulty'] == 'easy']  # 1-82
medium_questions = [q for q in questions if q['difficulty'] == 'medium']  # 83-132
hard_questions = [q for q in questions if q['difficulty'] == 'hard']  # 133-207

def escape_string(s):
    """Escape special characters for TypeScript strings"""
    if s is None:
        return "null"
    # Replace backslashes first, then other characters
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    # Don't escape $ as it's needed for LaTeX
    return s

def format_table_data(table_data):
    """Format table data as TypeScript array"""
    if not table_data:
        return "[]"

    rows = []
    for row in table_data:
        escaped_row = [f'"{escape_string(cell)}"' for cell in row]
        rows.append(f"[{', '.join(escaped_row)}]")

    # Join rows with actual newlines, not escaped
    rows_joined = ',\n        '.join(rows)
    return f"[\n        {rows_joined}\n      ]"

def format_column_headers(headers):
    """Format column headers as TypeScript array"""
    if not headers:
        return "[]"

    escaped_headers = [f'"{escape_string(h)}"' for h in headers]
    return f"[{', '.join(escaped_headers)}]"

def generate_question_ts(question, source_code="PQ"):
    """Generate TypeScript code for a single question"""
    q_num = question['question_number']
    q_text = escape_string(question['question_text'])

    # Get explanation
    explanation = explanation_map.get(q_num, "")
    explanation_str = escape_string(explanation)

    # Generate options
    options_str = "{\n"
    for key in ['a', 'b', 'c', 'd', 'e']:
        opt_val = escape_string(question['options'][key])
        options_str += f'        {key}: "{opt_val}",\n'
    options_str += "      }"

    # Get correct answer
    correct_answer = question['correct_answer']

    # Determine difficulty level (1-5)
    if question['difficulty'] == 'easy':
        difficulty_level = 2
    elif question['difficulty'] == 'medium':
        difficulty_level = 3
    else:  # hard
        difficulty_level = 4

    # Check for image
    image_url = None
    if question.get('image_local_location'):
        # Extract just the filename from the path
        image_filename = question['image_local_location'].split('\\')[-1]
        image_url = f"images/{image_filename}"

    # Start building questionData
    question_data_parts = [
        f'      question_text: "{q_text}"',
        f'      options: {options_str}',
    ]

    # Add image_url
    if image_url:
        question_data_parts.append(f'      image_url: "{image_url}"')
    else:
        question_data_parts.append('      image_url: null')

    question_data_parts.append('      image_options: null')

    # Add table data if present
    if question.get('has_table') and question.get('table_data'):
        if question.get('table_title'):
            table_title = escape_string(question['table_title'])
            question_data_parts.append(f'      table_title: "{table_title}"')

        if question.get('column_headers'):
            headers_str = format_column_headers(question['column_headers'])
            question_data_parts.append(f'      column_headers: {headers_str}')

        table_data_str = format_table_data(question['table_data'])
        question_data_parts.append(f'      table_data: {table_data_str}')

    # Add context_text if present (for charts/diagrams)
    if question.get('context_text'):
        context = escape_string(question['context_text'])
        question_data_parts.append(f'      context_text: "{context}"')

    question_data_str = ",\n".join(question_data_parts)

    ts_code = f'''  {{
    id: "QR-GMAT-{source_code}_-{q_num:05d}",
    question_number: {q_num},
    section: "Quantitative Reasoning",
    difficulty: "{question['difficulty']}",
    difficultyLevel: {difficulty_level},
    questionData: {{
{question_data_str},
    }} as QRQuestionData,
    answers: generateMCAnswers("{correct_answer}"),'''

    if explanation:
        ts_code += f'\n    explanation: "{explanation_str}",'

    ts_code += "\n    categories: [],\n  },"

    return ts_code

def generate_file(questions, difficulty, source_code="PQ"):
    """Generate complete TypeScript file for a difficulty level"""

    header = f'''import {{
  QuantitativeReasoningQuestion,
  QRQuestionData,
  generateMCAnswers,
}} from "../types";

// GMAT Practice Questions (Official) - Quantitative Reasoning
// Source: GMAT Practice QR (Not Started)
// Questions 1-82: Difficulty Easy
// Questions 83-132: Difficulty Medium
// Questions 133-207: Difficulty Hard

export const quantitativeReasoningQuestions{source_code}: QuantitativeReasoningQuestion[] = [
'''

    # Get question range
    first_q = questions[0]['question_number']
    last_q = questions[-1]['question_number']

    section_header = f'''  // ============================================
  // QUESTIONS {first_q}-{last_q}: {difficulty.upper()} DIFFICULTY
  // ============================================
'''

    questions_ts = "\n".join([generate_question_ts(q, source_code) for q in questions])

    footer = "\n];\n"

    return header + section_header + questions_ts + footer

# Generate files
print("Generating easy difficulty file...")
easy_content = generate_file(easy_questions, "easy")
with open('../../../questions/QR/quantitative_reasoning_PQ_easy.ts', 'w', encoding='utf-8') as f:
    f.write(easy_content)
print(f"[OK] Generated quantitative_reasoning_PQ_easy.ts with {len(easy_questions)} questions")

print("Generating medium difficulty file...")
medium_content = generate_file(medium_questions, "medium")
with open('../../../questions/QR/quantitative_reasoning_PQ_medium.ts', 'w', encoding='utf-8') as f:
    f.write(medium_content)
print(f"[OK] Generated quantitative_reasoning_PQ_medium.ts with {len(medium_questions)} questions")

print("Generating hard difficulty file...")
hard_content = generate_file(hard_questions, "hard")
with open('../../../questions/QR/quantitative_reasoning_PQ_hard.ts', 'w', encoding='utf-8') as f:
    f.write(hard_content)
print(f"[OK] Generated quantitative_reasoning_PQ_hard.ts with {len(hard_questions)} questions")

print("\nAll files generated successfully!")
print(f"Total questions: {len(questions)}")
