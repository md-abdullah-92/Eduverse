from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

import tempfile
import os
import json
import re
import time
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
from PyPDF2 import PdfReader

import faiss
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from anthropic import Anthropic
from groq import Groq
from openai import OpenAI
from google import genai
from google.genai import types

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

load_dotenv()

# Support both legacy `ANTHROPIC_API_KEY` and newer `ANTHROPIC_AUTH_TOKEN` names.
ANTHROPIC_AUTH_TOKEN = os.getenv("ANTHROPIC_AUTH_TOKEN")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY") or ANTHROPIC_AUTH_TOKEN
# Optional custom base URL (e.g. agentrouter or proxy)
ANTHROPIC_BASE_URL = os.getenv("ANTHROPIC_BASE_URL")

AI_MODEL = os.getenv(
    "AI_MODEL",
    os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8"),
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_REASONING_EFFORT = os.getenv("GROQ_REASONING_EFFORT", "medium")
AI_PROVIDER = os.getenv("AI_PROVIDER", "").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")
AI_REASONING_EFFORT = os.getenv("AI_REASONING_EFFORT")

if AI_PROVIDER == "groq":
    if not GROQ_API_KEY:
        raise ValueError("Groq credentials not found. Set GROQ_API_KEY in .env.")

    groq_client = Groq(api_key=GROQ_API_KEY)
    openai_client = None
    gemini_client = None
    client = None
elif AI_MODEL.startswith("gemini"):
    if not GEMINI_API_KEY:
        raise ValueError(
            "Gemini credentials not found. Set GEMINI_API_KEY in .env."
        )

    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    openai_client = None
    client = None
elif AI_MODEL in {"gpt-6-astra", "glm-5.3"}:
    if not OPENAI_API_KEY:
        raise ValueError(
            f"OpenAI credentials not found. Set OPENAI_API_KEY for {AI_MODEL}."
        )

    openai_client_kwargs = {"api_key": OPENAI_API_KEY}
    if AI_MODEL == "glm-5.3":
        openai_client_kwargs["base_url"] = (
            OPENAI_BASE_URL or "https://api.z.ai/api/paas/v4"
        ).rstrip("/")
    elif OPENAI_BASE_URL:
        openai_client_kwargs["base_url"] = OPENAI_BASE_URL.rstrip("/")

    openai_client = OpenAI(**openai_client_kwargs)
    client = None
else:
    if not ANTHROPIC_API_KEY:
        raise ValueError(
            "Anthropic credentials not found. Set ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN in your environment."
        )

    client_kwargs = {"api_key": ANTHROPIC_API_KEY}
    if ANTHROPIC_BASE_URL:
        client_kwargs["base_url"] = ANTHROPIC_BASE_URL.rstrip("/")

    client = Anthropic(**client_kwargs)
    openai_client = None
    gemini_client = None

ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Educational PDF AI API",
    description="PDF-based educational question and study-note generator",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CONSTANTS
# ============================================================

MAX_QUESTIONS = 20

DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200

MAX_RETRIES = 3

SUPPORTED_QUESTION_TYPES = {
    "mcq",
    "short_answer",
}


# ============================================================
# GENERAL HELPERS
# ============================================================

def clean_text(text: str) -> str:
    """
    Clean extracted PDF text while preserving useful structure.
    """
    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces but preserve newlines.
    text = re.sub(r"[ \t]+", " ", text)

    # Reduce excessive blank lines.
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def normalize_question_text(text: str) -> str:
    """
    Normalize question text for duplicate detection.
    """
    if not text:
        return ""

    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)

    return text


def safe_int(value: Any, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def collect_questions_until_target(
    chunks: List[Any],
    generator,
    target_count: int,
) -> List[Dict[str, Any]]:
    """
    Keep generating/collecting questions from all available chunks until the
    requested total is reached, instead of stopping early on duplicate or bad
    responses from a few chunks.
    """
    questions: List[Dict[str, Any]] = []
    used_questions = set()
    seen_chunk_ids = set()

    ordered_chunks: List[Any] = []

    for chunk in chunks:
        if id(chunk) in seen_chunk_ids:
            continue
        seen_chunk_ids.add(id(chunk))
        ordered_chunks.append(chunk)

    for chunk in ordered_chunks:
        if len(questions) >= target_count:
            break

        try:
            question = generator(chunk)

            if not isinstance(question, dict):
                continue

            normalized = normalize_question_text(
                str(question.get("question") or "")
            )

            if not normalized or normalized in used_questions:
                continue

            used_questions.add(normalized)
            questions.append(question)

        except Exception as exc:
            print(f"Question generation failed on a chunk: {exc}")
            continue

    return questions


# ============================================================
# PDF PROCESSING
# ============================================================

def extract_pdf_documents(
    path: str,
    start_page: int = 1,
    end_page: Optional[int] = None
) -> List[Document]:
    """
    Extract readable text from a PDF while preserving page metadata.
    """

    documents = []

    reader = PdfReader(path)
    total_pages = len(reader.pages)

    if total_pages == 0:
        return []

    start_page = max(1, start_page)

    if end_page is None:
        end_page = total_pages
    else:
        end_page = min(end_page, total_pages)

    if start_page > end_page:
        return []

    for page_number in range(start_page, end_page + 1):

        page = reader.pages[page_number - 1]

        try:
            raw_text = page.extract_text() or ""
        except Exception as exc:
            print(
                f"Failed to extract page {page_number}: {exc}"
            )
            continue

        text = clean_text(raw_text)

        if not text:
            continue

        documents.append(
            Document(
                page_content=text,
                metadata={
                    "source": path,
                    "page": page_number,
                    "doc_type": "educational_material",
                }
            )
        )

    return documents


def chunk_documents(
    documents: List[Document],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP
) -> List[Document]:
    """
    Split PDF pages into smaller semantic chunks.
    """

    if not documents:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=[
            "\n\n",
            "\n",
            ". ",
            "! ",
            "? ",
            "; ",
            ", ",
            " ",
            "",
        ],
        length_function=len,
    )

    chunks = splitter.split_documents(documents)

    # Make sure every chunk has source page metadata.
    for chunk in chunks:
        if "page" not in chunk.metadata:
            chunk.metadata["page"] = "Unknown"

    return chunks


def chunking(
    path: str,
    start_page: int = 1,
    end_page: Optional[int] = None,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP
) -> List[Document]:
    """
    Complete PDF -> Document chunks pipeline.
    """

    try:
        documents = extract_pdf_documents(
            path,
            start_page=start_page,
            end_page=end_page,
        )

        if not documents:
            return []

        return chunk_documents(
            documents,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    except Exception as exc:
        print(f"Error in chunking: {exc}")
        return []


# ============================================================
# TF-IDF + FAISS RETRIEVAL
# ============================================================

class RetrievalIndex:
    """
    TF-IDF vectorizer + FAISS cosine-similarity index.

    This replaces the previous situation where FAISS was created
    but never actually used by /quiz/.
    """

    def __init__(self, chunks: List[Document]):
        self.chunks = chunks
        self.vectorizer = None
        self.index = None

    def build(self):
        if not self.chunks:
            raise ValueError("Cannot build index from empty chunks.")

        texts = [
            chunk.page_content
            for chunk in self.chunks
        ]

        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            max_features=50000,
        )

        matrix = self.vectorizer.fit_transform(texts)

        dense_vectors = matrix.toarray().astype("float32")

        # Normalize vectors so inner product = cosine similarity.
        faiss.normalize_L2(dense_vectors)

        dimension = dense_vectors.shape[1]

        self.index = faiss.IndexFlatIP(dimension)

        self.index.add(dense_vectors)

        return self

    def search(
        self,
        query: str,
        top_k: int = 5
    ) -> List[Document]:

        if not self.index or not self.vectorizer:
            raise RuntimeError("Retrieval index has not been built.")

        if not query.strip():
            return []

        query_vector = self.vectorizer.transform(
            [query]
        ).toarray().astype("float32")

        faiss.normalize_L2(query_vector)

        k = min(top_k, len(self.chunks))

        scores, indices = self.index.search(
            query_vector,
            k
        )

        results = []

        for index in indices[0]:

            if index < 0:
                continue

            results.append(
                self.chunks[index]
            )

        return results


def build_index(chunks: List[Document]):
    """
    Compatibility helper.
    """

    retrieval_index = RetrievalIndex(chunks)
    retrieval_index.build()

    return (
        retrieval_index.index,
        retrieval_index.vectorizer,
        retrieval_index,
    )


# ============================================================
# CLAUDE API
# ============================================================

def call_claude(
    prompt: str,
    system_prompt: str = (
        "You are a careful educational AI assistant."
    ),
    max_tokens: int = 2048,
) -> str:
    """
    Call Claude with retry handling.
    """

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            if AI_MODEL.startswith("gemini"):
                response = gemini_client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        max_output_tokens=max_tokens,
                    ),
                )
                text = (response.text or "").strip()
            elif AI_PROVIDER == "groq":
                completion = groq_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt,
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    temperature=1,
                    max_completion_tokens=max_tokens,
                    top_p=1,
                    reasoning_effort=GROQ_REASONING_EFFORT,
                    stream=True,
                    stop=None,
                )
                text = "".join(
                    chunk.choices[0].delta.content or ""
                    for chunk in completion
                ).strip()
            elif AI_MODEL == "gpt-6-astra":
                response_kwargs = {
                    "model": AI_MODEL,
                    "instructions": system_prompt,
                    "input": prompt,
                    "max_output_tokens": max_tokens,
                }
                if AI_REASONING_EFFORT:
                    response_kwargs["reasoning"] = {
                        "effort": AI_REASONING_EFFORT,
                    }

                response = openai_client.responses.create(**response_kwargs)
                if isinstance(response, str):
                    text = response.strip()
                else:
                    text = (getattr(response, "output_text", "") or "").strip()
            elif AI_MODEL == "glm-5.3":
                response_kwargs = {
                    "model": AI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": system_prompt,
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        },
                    ],
                    "max_tokens": max_tokens,
                    "extra_body": {
                        "thinking": {
                            "type": "enabled",
                        },
                        "reasoning_effort": AI_REASONING_EFFORT or "max",
                    },
                }

                response = openai_client.chat.completions.create(
                    **response_kwargs
                )
                if isinstance(response, str):
                    text = response.strip()
                else:
                    text = (
                        response.choices[0].message.content or ""
                    ).strip()
            else:
                response = client.messages.create(
                    model=ANTHROPIC_MODEL,
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                )

                if not response.content:
                    raise ValueError(
                        "Claude returned an empty response."
                    )

                text_parts = []

                for block in response.content:

                    if getattr(block, "type", None) == "text":

                        block_text = getattr(
                            block,
                            "text",
                            ""
                        )

                        if block_text:
                            text_parts.append(block_text)

                text = "".join(text_parts).strip()

            if not text:
                raise ValueError(
                    "Claude response did not contain text."
                )

            return text

        except Exception as exc:

            last_error = exc

            print(
                f"AI attempt {attempt}/{MAX_RETRIES} failed: "
                f"{exc}"
            )

            if attempt < MAX_RETRIES:
                time.sleep(2 ** (attempt - 1))

    raise RuntimeError(
        f"Claude API failed after {MAX_RETRIES} attempts: "
        f"{last_error}"
    )


# ============================================================
# JSON PARSING
# ============================================================

def parse_json_from_text(text: str) -> Dict[str, Any]:
    """
    Parse JSON even when an LLM accidentally wraps it in
    markdown code fences.
    """

    if not text:
        raise ValueError("Empty response.")

    text = text.strip()

    # Direct JSON.
    try:
        parsed = json.loads(text)

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # JSON inside ```json ... ```
    code_block_match = re.search(
        r"```(?:json)?\s*(.*?)\s*```",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )

    if code_block_match:

        candidate = code_block_match.group(1).strip()

        try:
            parsed = json.loads(candidate)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    # Find the outermost JSON object.
    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = text[start:end + 1]

        try:
            parsed = json.loads(candidate)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    raise ValueError(
        "Claude response was not valid JSON."
    )


# ============================================================
# MCQ VALIDATION
# ============================================================

def normalize_mcq_question(
    raw_question: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Validate and normalize an MCQ.

    Unlike the original version, this function DOES NOT create
    fake options such as 'Option 3' when Claude fails.
    """

    if not isinstance(raw_question, dict):
        raise ValueError(
            "MCQ response must be a JSON object."
        )

    question_text = str(
        raw_question.get("question") or ""
    ).strip()

    if not question_text:
        raise ValueError(
            "MCQ question text is missing."
        )

    # --------------------------------------------------------
    # Collect options
    # --------------------------------------------------------

    option_entries = []

    options = raw_question.get("options")

    if isinstance(options, list):
        option_entries.extend(
            str(item).strip()
            for item in options
            if str(item).strip()
        )

    elif isinstance(options, dict):

        for key in ["A", "B", "C", "D"]:

            if key in options:

                value = str(
                    options[key]
                ).strip()

                if value:
                    option_entries.append(value)

    choices = raw_question.get("choices")

    if isinstance(choices, list):

        option_entries.extend(
            str(item).strip()
            for item in choices
            if str(item).strip()
        )

    for key in [
        "option_a",
        "option_b",
        "option_c",
        "option_d",
    ]:

        value = raw_question.get(key)

        if value is not None:

            value = str(value).strip()

            if value:
                option_entries.append(value)

    # Remove duplicates while preserving order.
    unique_options = []

    seen = set()

    for option in option_entries:

        normalized = option.lower()

        if normalized not in seen:

            seen.add(normalized)
            unique_options.append(option)

    if len(unique_options) != 4:

        raise ValueError(
            f"MCQ must contain exactly 4 unique options. "
            f"Found {len(unique_options)}."
        )

    options = unique_options[:4]

    # --------------------------------------------------------
    # Correct answer
    # --------------------------------------------------------

    correct_raw = (
        raw_question.get("correct_answer")
        or raw_question.get("correctAnswer")
        or raw_question.get("answer")
    )

    if correct_raw is None:

        raise ValueError(
            "MCQ correct_answer is missing."
        )

    correct_value = str(
        correct_raw
    ).strip()

    letter_order = [
        "A",
        "B",
        "C",
        "D",
    ]

    final_letter = None
    final_answer = None

    # A/B/C/D
    upper_value = correct_value.upper()

    if upper_value in letter_order:

        final_letter = upper_value
        final_answer = options[letter_order.index(final_letter)]

    else:

        # Match exact option text.
        normalized_correct = (
            correct_value
            .strip()
            .lower()
        )

        for index, option in enumerate(options):

            if option.strip().lower() == normalized_correct:

                final_letter = letter_order[index]
                final_answer = option
                break

    if final_letter is None:

        raise ValueError(
            "correct_answer does not match A/B/C/D "
            "or any option."
        )

    if final_answer is None:
        final_answer = options[letter_order.index(final_letter)]

    # --------------------------------------------------------
    # Difficulty
    # --------------------------------------------------------

    difficulty = str(
        raw_question.get("difficulty")
        or "medium"
    ).strip().lower()

    if difficulty not in {
        "easy",
        "medium",
        "hard",
    }:

        difficulty = "medium"

    explanation = str(
        raw_question.get("explanation")
        or ""
    ).strip()

    if not explanation:

        explanation = (
            "The answer is supported by the provided "
            "educational content."
        )

    return {
        "question": question_text,
        "options": options,
        "correct_answer": final_answer,
        "correctAnswer": final_answer,
        "answer_letter": final_letter,
        "option_index": (
            letter_order.index(final_letter) + 1
        ),
        "explanation": explanation,
        "difficulty": difficulty,
        "type": "mcq",
    }


# ============================================================
# PROMPT HELPERS
# ============================================================

def build_mcq_prompt(
    content: str,
    difficulty: str = "medium"
) -> str:

    return f"""
You are an expert educational question writer.

Create ONE high-quality multiple-choice question using
ONLY the supplied educational content.

Requirements:

1. The question must be answerable from the content.
2. Create exactly four options.
3. Exactly one option must be correct.
4. The incorrect options must be plausible.
5. Do not use "all of the above".
6. Do not use "none of the above".
7. Do not invent facts that are absent from the content.
8. Avoid ambiguous wording.
9. Match the requested difficulty.
10. Return ONLY valid JSON.
11. Do not use Markdown.

Required JSON structure:

{{
  "question": "string",
  "option_a": "string",
  "option_b": "string",
  "option_c": "string",
  "option_d": "string",
  "correct_answer": "A",
  "explanation": "string",
  "difficulty": "{difficulty}"
}}

Educational content:

{content}
""".strip()


def build_short_answer_prompt(
    content: str
) -> str:

    return f"""
You are an expert educational question writer.

Create ONE high-quality short-answer question using ONLY
the supplied educational content.

Requirements:

1. The question must be answerable from the content.
2. Do not invent facts.
3. The answer should be concise but academically meaningful.
4. Avoid yes/no questions unless the content specifically
   requires them.
5. Return ONLY valid JSON.
6. Do not use Markdown.

Required JSON structure:

{{
  "question": "string",
  "type": "short_answer",
  "correct_answer": "string",
  "explanation": "string",
  "difficulty": "easy|medium|hard"
}}

Educational content:

{content}
""".strip()


# ============================================================
# QUESTION GENERATION
# ============================================================

def generate_mcq_from_content(
    content: str,
    difficulty: str = "medium"
) -> Dict[str, Any]:

    prompt = build_mcq_prompt(
        content,
        difficulty
    )

    text = call_claude(
        prompt,
        system_prompt=(
            "You are a careful educational MCQ generator. "
            "Return only valid JSON."
        ),
        max_tokens=1200,
    )

    return parse_json_from_text(text)


def generate_short_answer_from_content(
    content: str
) -> Dict[str, Any]:

    prompt = build_short_answer_prompt(
        content
    )

    text = call_claude(
        prompt,
        system_prompt=(
            "You are a careful educational question generator. "
            "Return only valid JSON."
        ),
        max_tokens=1200,
    )

    return parse_json_from_text(text)


# ============================================================
# RETRY QUESTION GENERATION
# ============================================================

def generate_valid_mcq(
    content: str,
    difficulty: str = "medium"
) -> Dict[str, Any]:

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            raw = generate_mcq_from_content(
                content,
                difficulty
            )

            return normalize_mcq_question(raw)

        except Exception as exc:

            last_error = exc

            print(
                f"MCQ validation attempt "
                f"{attempt}/{MAX_RETRIES} failed: {exc}"
            )

    raise RuntimeError(
        f"Unable to generate valid MCQ: {last_error}"
    )


def validate_short_answer(
    raw: Dict[str, Any]
) -> Dict[str, Any]:

    if not isinstance(raw, dict):

        raise ValueError(
            "Short-answer response must be JSON object."
        )

    question = str(
        raw.get("question") or ""
    ).strip()

    answer = str(
        raw.get("correct_answer") or ""
    ).strip()

    if not question:
        raise ValueError(
            "Short-answer question is empty."
        )

    if not answer:
        raise ValueError(
            "Short-answer answer is empty."
        )

    difficulty = str(
        raw.get("difficulty")
        or "medium"
    ).strip().lower()

    if difficulty not in {
        "easy",
        "medium",
        "hard",
    }:

        difficulty = "medium"

    explanation = str(
        raw.get("explanation")
        or ""
    ).strip()

    return {
        "question": question,
        "type": "short_answer",
        "correct_answer": answer,
        "explanation": explanation,
        "difficulty": difficulty,
    }


def generate_valid_short_answer(
    content: str
) -> Dict[str, Any]:

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            raw = generate_short_answer_from_content(
                content
            )

            return validate_short_answer(raw)

        except Exception as exc:

            last_error = exc

            print(
                f"Short-answer validation attempt "
                f"{attempt}/{MAX_RETRIES} failed: {exc}"
            )

    raise RuntimeError(
        f"Unable to generate valid short question: "
        f"{last_error}"
    )


# ============================================================
# UPLOAD ENDPOINT
# ============================================================

@app.post("/upload/")
async def upload(
    file: UploadFile = File(...)
):
    """
    Upload a PDF and return page count.
    """

    if not file.filename:

        return JSONResponse(
            status_code=400,
            content={
                "error": "No file selected."
            }
        )

    if not file.filename.lower().endswith(".pdf"):

        return JSONResponse(
            status_code=400,
            content={
                "error": "Only PDF files are supported."
            }
        )

    path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as tmp:

            tmp.write(
                await file.read()
            )

            path = tmp.name

        reader = PdfReader(path)

        total_pages = len(reader.pages)

        return {
            "message": "File uploaded successfully.",
            "filename": file.filename,
            "total_pages": total_pages,
        }

    except Exception as exc:

        return JSONResponse(
            status_code=400,
            content={
                "error": f"Failed to read PDF: {exc}"
            }
        )

    finally:

        if path and os.path.exists(path):

            try:
                os.remove(path)
            except Exception:
                pass


# ============================================================
# QUIZ ENDPOINT
# ============================================================

@app.post("/quiz/")
async def quiz(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: Optional[int] = Form(None),
    num_questions: int = Form(5),
    question_type: str = Form("mcq"),
    difficulty: str = Form("medium"),
):
    """
    Generate MCQ or short-answer questions from selected
    PDF pages.
    """

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    start_page = safe_int(
        start_page,
        1
    )

    num_questions = safe_int(
        num_questions,
        5
    )

    if end_page is not None:

        end_page = safe_int(
            end_page,
            start_page
        )

    question_type = (
        question_type or "mcq"
    ).strip().lower()

    difficulty = (
        difficulty or "medium"
    ).strip().lower()

    if start_page < 1:

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Start page must be at least 1."
                )
            }
        )

    if (
        end_page is not None
        and start_page > end_page
    ):

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Start page cannot be greater "
                    "than end page."
                )
            }
        )

    if not 1 <= num_questions <= MAX_QUESTIONS:

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    f"Number of questions must be "
                    f"between 1 and {MAX_QUESTIONS}."
                )
            }
        )

    if question_type not in SUPPORTED_QUESTION_TYPES:

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "question_type must be "
                    "'mcq' or 'short_answer'."
                )
            }
        )

    if difficulty not in {
        "easy",
        "medium",
        "hard",
    }:

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "difficulty must be "
                    "'easy', 'medium', or 'hard'."
                )
            }
        )

    # --------------------------------------------------------
    # Save PDF
    # --------------------------------------------------------

    path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as tmp:

            tmp.write(
                await file.read()
            )

            path = tmp.name

        # ----------------------------------------------------
        # Extract and chunk
        # ----------------------------------------------------

        chunks = chunking(
            path,
            start_page=start_page,
            end_page=end_page,
        )

        if not chunks:

            return JSONResponse(
                status_code=400,
                content={
                    "error": (
                        "No readable content found "
                        "in the selected pages."
                    )
                }
            )

        # ----------------------------------------------------
        # Build actual retrieval index
        # ----------------------------------------------------

        retrieval = RetrievalIndex(
            chunks
        )

        retrieval.build()

        # ----------------------------------------------------
        # Select diverse chunks
        # ----------------------------------------------------

        # We don't want the same area repeatedly.
        selected_chunks = []

        step = max(
            1,
            len(chunks) // num_questions
        )

        candidate_positions = list(
            range(
                0,
                len(chunks),
                step
            )
        )

        for position in candidate_positions:

            if len(selected_chunks) >= num_questions:
                break

            selected_chunks.append(
                chunks[position]
            )

        # If not enough, fill from remaining chunks.
        if len(selected_chunks) < num_questions:

            selected_ids = {
                id(chunk)
                for chunk in selected_chunks
            }

            for chunk in chunks:

                if id(chunk) in selected_ids:
                    continue

                selected_chunks.append(chunk)

                if len(selected_chunks) >= num_questions:
                    break

        # ----------------------------------------------------
        # Generate questions
        # ----------------------------------------------------

        def build_question_for_chunk(chunk):
            retrieved = retrieval.search(
                chunk.page_content[:1000],
                top_k=3
            )

            context_parts = []

            for retrieved_chunk in retrieved:

                page = retrieved_chunk.metadata.get(
                    "page",
                    "Unknown"
                )

                context_parts.append(
                    f"[Page {page}]\n"
                    f"{retrieved_chunk.page_content}"
                )

            context = "\n\n".join(
                context_parts
            )

            if question_type == "mcq":
                question = generate_valid_mcq(
                    context,
                    difficulty=difficulty
                )
            else:
                question = generate_valid_short_answer(
                    context
                )

            question["source_page"] = (
                chunk.metadata.get(
                    "page",
                    "Unknown"
                )
            )

            return question

        questions = collect_questions_until_target(
            chunks,
            build_question_for_chunk,
            num_questions,
        )

        if not questions:

            return JSONResponse(
                status_code=500,
                content={
                    "error": (
                        "Failed to generate questions "
                        "from the selected content."
                    )
                }
            )

        return {
            "questions": questions,
            "total_questions": len(questions),
            "requested_questions": num_questions,
            "question_type": question_type,
            "difficulty": difficulty,
            "pages_processed": {
                "start": start_page,
                "end": end_page or "end",
            },
            "chunks_processed": len(chunks),
        }

    except Exception as exc:

        print(
            f"Quiz generation failed: {exc}"
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": (
                    f"Quiz generation failed: {exc}"
                )
            }
        )

    finally:

        if path and os.path.exists(path):

            try:
                os.remove(path)
            except Exception:
                pass


# ============================================================
# STUDY NOTES
# ============================================================

def summarize_chunk(
    chunk: Document
) -> str:
    """
    Summarize one chunk.
    """

    page = chunk.metadata.get(
        "page",
        "Unknown"
    )

    prompt = f"""
Summarize the following educational material.

Requirements:

- Preserve factual information.
- Do not invent information.
- Include important definitions.
- Include key concepts.
- Include important formulas or relationships
  if present.
- Keep the summary suitable for later combination
  into student study notes.
- Do not mention that you are an AI.

Source page: {page}

Content:

{chunk.page_content}
""".strip()

    return call_claude(
        prompt,
        system_prompt=(
            "You are an educational tutor creating "
            "accurate study-material summaries."
        ),
        max_tokens=1800,
    )


def combine_summaries(
    summaries: List[str],
    start_page: int,
    end_page: int
) -> str:
    """
    Combine intermediate summaries into final notes.
    """

    combined = "\n\n".join(
        f"Summary {i + 1}:\n{summary}"
        for i, summary in enumerate(summaries)
    )

    prompt = f"""
Create formal student study notes from the supplied
intermediate summaries.

Pages covered: {start_page} to {end_page}

Requirements:

- Use clear headings.
- Use bullet points where appropriate.
- Include key concepts.
- Include definitions.
- Preserve important facts.
- Preserve formulas and scientific relationships
  mentioned in the summaries.
- Do not introduce information that is absent from
  the supplied summaries.
- Avoid unnecessary repetition.
- Make the notes easy for students to revise.

Intermediate summaries:

{combined}
""".strip()

    return call_claude(
        prompt,
        system_prompt=(
            "You are a helpful educational tutor. "
            "Create accurate, clear, academic study notes."
        ),
        max_tokens=4000,
    )


@app.post("/generate-study-notes/")
async def generate_study_notes(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: Optional[int] = Form(None)
):
    """
    Generate study notes using map-reduce style processing:

    PDF
      -> chunks
      -> individual summaries
      -> final combined notes
    """

    start_page = safe_int(
        start_page,
        1
    )

    if end_page is not None:

        end_page = safe_int(
            end_page,
            start_page
        )

    if start_page < 1:

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Start page must be at least 1."
                )
            }
        )

    if (
        end_page is not None
        and start_page > end_page
    ):

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Start page cannot be greater "
                    "than end page."
                )
            }
        )

    path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as tmp:

            tmp.write(
                await file.read()
            )

            path = tmp.name

        reader = PdfReader(path)

        total_pages = len(reader.pages)

        if end_page is None:

            end_page = total_pages

        else:

            end_page = min(
                end_page,
                total_pages
            )

        chunks = chunking(
            path,
            start_page=start_page,
            end_page=end_page,
        )

        if not chunks:

            return JSONResponse(
                status_code=400,
                content={
                    "error": (
                        "No readable content found "
                        "in the selected pages."
                    )
                }
            )

        # ----------------------------------------------------
        # Generate intermediate summaries
        # ----------------------------------------------------

        summaries = []

        for index, chunk in enumerate(chunks):

            try:

                summary = summarize_chunk(
                    chunk
                )

                if summary.strip():
                    summaries.append(summary)

                print(
                    f"Summarized chunk "
                    f"{index + 1}/{len(chunks)}"
                )

            except Exception as exc:

                print(
                    f"Summary failed for chunk "
                    f"{index + 1}: {exc}"
                )

        if not summaries:

            return JSONResponse(
                status_code=500,
                content={
                    "error": (
                        "Failed to generate "
                        "intermediate summaries."
                    )
                }
            )

        # ----------------------------------------------------
        # Final notes
        # ----------------------------------------------------

        notes = combine_summaries(
            summaries,
            start_page,
            end_page,
        )

        return {
            "notes": notes,
            "length": len(notes.split()),
            "chunks_processed": len(chunks),
            "summaries_generated": len(summaries),
            "pages_processed": {
                "start": start_page,
                "end": end_page,
            },
        }

    except Exception as exc:

        print(
            f"Study notes generation failed: {exc}"
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": (
                    f"Study notes generation failed: {exc}"
                )
            }
        )

    finally:

        if path and os.path.exists(path):

            try:
                os.remove(path)
            except Exception:
                pass


# ============================================================
# SHORT QUESTIONS ENDPOINT
# ============================================================

@app.post("/short-questions/")
async def generate_all_short_questions(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: Optional[int] = Form(None)
):
    """
    Generate short-answer questions from PDF chunks.

    Uses a time limit to prevent extremely long requests.
    """

    start_page = safe_int(
        start_page,
        1
    )

    if end_page is not None:

        end_page = safe_int(
            end_page,
            start_page
        )

    if start_page < 1:

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Start page must be at least 1."
                )
            }
        )

    if (
        end_page is not None
        and start_page > end_page
    ):

        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Start page cannot be greater "
                    "than end page."
                )
            }
        )

    path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as tmp:

            tmp.write(
                await file.read()
            )

            path = tmp.name

        chunks = chunking(
            path,
            start_page=start_page,
            end_page=end_page,
        )

        if not chunks:

            return JSONResponse(
                status_code=400,
                content={
                    "error": (
                        "No readable content found "
                        "in the selected pages."
                    )
                }
            )

        question_list = []

        used_questions = set()

        start_time = time.time()

        TIME_LIMIT = 60

        for index, chunk in enumerate(chunks):

            if time.time() - start_time >= TIME_LIMIT:

                print(
                    "Short-question time limit reached."
                )

                break

            try:

                parsed = generate_valid_short_answer(
                    chunk.page_content
                )

                question_text = parsed["question"]

                normalized = normalize_question_text(
                    question_text
                )

                if normalized in used_questions:
                    continue

                used_questions.add(
                    normalized
                )

                source_page = chunk.metadata.get(
                    "page",
                    "Unknown"
                )

                question_list.append(
                    f"{len(question_list) + 1}. "
                    f"{question_text.strip()} "
                    f"(Page {source_page})"
                )

                print(
                    f"Generated question "
                    f"{len(question_list)} "
                    f"from chunk {index + 1}"
                )

            except Exception as exc:

                print(
                    f"Error on chunk {index}: {exc}"
                )

                continue

        if not question_list:

            return JSONResponse(
                status_code=500,
                content={
                    "error": (
                        "Failed to generate short "
                        "questions."
                    )
                }
            )

        header = (
            "# Short Answer Questions\n\n"
            f"**Pages {start_page} to "
            f"{end_page or 'end'}**\n\n"
        )

        full_text = (
            header
            + "\n".join(question_list)
        )

        return Response(
            content=full_text,
            media_type="text/markdown",
        )

    except Exception as exc:

        print(
            f"Short questions generation failed: {exc}"
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": (
                    f"Short questions generation failed: "
                    f"{exc}"
                )
            }
        )

    finally:

        if path and os.path.exists(path):

            try:
                os.remove(path)
            except Exception:
                pass


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
async def root():
    """
    Basic health check.
    """

    return {
        "message": "PDF Processing API is running",
        "status": "healthy",
        "version": "2.0.0",
    }


@app.get("/health")
async def health_check():
    """
    Detailed health check.
    """

    return {
        "status": "healthy",
        "anthropic_configured": bool(
            ANTHROPIC_API_KEY
        ),
        "model": AI_MODEL,
        "endpoints": [
            "/",
            "/health",
            "/upload/",
            "/quiz/",
            "/generate-study-notes/",
            "/short-questions/",
        ],
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )