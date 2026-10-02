from main import normalize_mcq_question, collect_questions_until_target


def test_collect_questions_until_target_scans_all_chunks_for_requested_count():
    chunks = [
        {"page_content": "Topic A", "metadata": {"page": 1}},
        {"page_content": "Topic B", "metadata": {"page": 2}},
        {"page_content": "Topic C", "metadata": {"page": 3}},
        {"page_content": "Topic D", "metadata": {"page": 4}},
    ]

    def fake_generator(chunk):
        mapping = {
            "Topic A": {
                "question": "What is 2 + 2?",
                "options": ["3", "4", "5", "6"],
                "correct_answer": "B",
                "explanation": "2 + 2 = 4",
                "difficulty": "easy",
            },
            "Topic B": {
                "question": "What is the capital of France?",
                "options": ["Berlin", "Paris", "Rome", "Madrid"],
                "correct_answer": "B",
                "explanation": "Paris is the capital.",
                "difficulty": "easy",
            },
            "Topic C": {
                "question": "Which planet is known as the Red Planet?",
                "options": ["Earth", "Mars", "Venus", "Jupiter"],
                "correct_answer": "B",
                "explanation": "Mars is red.",
                "difficulty": "easy",
            },
            "Topic D": {
                "question": "Which gas do plants use for photosynthesis?",
                "options": ["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"],
                "correct_answer": "B",
                "explanation": "Plants use carbon dioxide.",
                "difficulty": "easy",
            },
        }
        return mapping[chunk["page_content"]]

    questions = collect_questions_until_target(
        chunks,
        fake_generator,
        3,
    )

    assert len(questions) == 3
    assert {q["question"] for q in questions} == {
        "What is 2 + 2?",
        "What is the capital of France?",
        "Which planet is known as the Red Planet?",
    }


def test_normalize_mcq_question_keeps_four_options_and_valid_answer():
    raw = {
        "question": "What is 2 + 2?",
        "option_a": "3",
        "option_b": "4",
        "option_c": "5",
        "option_d": "6",
        "correct_answer": "B",
        "explanation": "2 + 2 = 4",
        "difficulty": "easy",
    }

    normalized = normalize_mcq_question(raw)

    assert normalized["question"] == "What is 2 + 2?"
    assert normalized["options"] == ["3", "4", "5", "6"]
    assert normalized["correct_answer"] == "4"
    assert normalized["correctAnswer"] == "4"
    assert normalized["answer_letter"] == "B"
    assert normalized["option_index"] == 2


def test_normalize_mcq_question_fills_missing_choices_and_sets_valid_answer():
    raw = {
        "question": "Capital of France?",
        "option_a": "Paris",
        "option_b": "London",
        "correct_answer": "A",
    }

    normalized = normalize_mcq_question(raw)

    assert len(normalized["options"]) == 4
    assert normalized["correct_answer"] == "Paris"
    assert normalized["correctAnswer"] == "Paris"
    assert normalized["answer_letter"] == "A"
    assert set(normalized["options"]) >= {"Paris", "London"}
