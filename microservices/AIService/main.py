from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile, os, random, uuid
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
import faiss
import numpy as np

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain import LLMChain, PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
# env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")

# llm model
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

#chunks
def chunking(path, chunk_size = 800, chunk_overlap = 200):

    documents = []
    for page_num, page in enumerate(PdfReader(path).pages):
        content = page.extract_text()
        if content and content.strip():
            content = content.replace('\n\n\n', '\n\n') 
            content = ' '.join(content.split())
            
            doc = Document(
                page_content=content,
                metadata={
                    "source": path,
                    "page": page_num + 1,
                    "doc_type": "educational_material"
                }
            )
            documents.append(doc)
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=[
            "\n\n",      # Paragraph breaks (highest priority)
            "\n",        # Line breaks
            ". ",        # Sentence endings
            "! ",        # Exclamation sentences
            "? ",        # Question sentences
            "; ",        # Semicolons
            ", ",        # Commas
            " ",         # Spaces
            ""           # Characters (last resort)
        ],
        length_function=len,
    )
    
    chunks = text_splitter.split_documents(documents)
    
    return chunks



def build_index(chunks):
    texts = [doc.page_content for doc in chunks]
    vectorizer = TfidfVectorizer().fit(texts)
    matrix = vectorizer.transform(texts).toarray().astype(np.float32)
    index = faiss.IndexFlatL2(matrix.shape[1])
    index.add(matrix)
    return index, vectorizer

#chain
def build_mcq_chain():
    schemas = [
        ResponseSchema(name="question", description="The MCQ question text"),
        ResponseSchema(name="type", description="Should always be 'mcq'"),
        ResponseSchema(name="option_a", description="Option A"),
        ResponseSchema(name="option_b", description="Option B"),
        ResponseSchema(name="option_c", description="Option C"),
        ResponseSchema(name="option_d", description="Option D"),
        ResponseSchema(name="correct_answer", description="Correct option: A, B, C or D"),
        ResponseSchema(name="explanation", description="1-2 line explanation"),
        ResponseSchema(name="difficulty", description="Difficulty: easy, medium, hard")
    ]
    parser = StructuredOutputParser.from_response_schemas(schemas)

    prompt = PromptTemplate(
        input_variables=["content"],
        template="""
You are an AI service that generates **Multiple Choice Questions (MCQs)** from educational text.

From the content below, create ONE MCQ:
- Provide 4 options labeled A to D
- Mark the correct answer as A/B/C/D
- Add a short explanation and difficulty level

Content:
{content}

{format_instructions}
""",
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )

    return LLMChain(prompt=prompt, llm=llm), parser


def build_short_answer_chain():
    schemas = [
        ResponseSchema(name="question", description="The Short Answer question text"),
        ResponseSchema(name="type", description="Should always be 'short_answer'"),
        ResponseSchema(name="correct_answer", description="Short descriptive answer"),
        ResponseSchema(name="explanation", description="1-2 line explanation"),
        ResponseSchema(name="difficulty", description="Difficulty: easy, medium, hard")
    ]
    parser = StructuredOutputParser.from_response_schemas(schemas)

    prompt = PromptTemplate(
        input_variables=["content"],
        template="""
You are an AI service that generates **Short Answer Questions** from educational text.

From the content below, create ONE short-answer (descriptive) question.
- Do not generate options.
- Provide a correct answer as a sentence.
- Add a short explanation and difficulty level.

Content:
{content}

{format_instructions}
""",
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )

    return LLMChain(prompt=prompt, llm=llm), parser


mcq_chain, mcq_parser = build_mcq_chain()
short_chain, short_parser = build_short_answer_chain()

#upload
@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        path = tmp.name

    chunks = chunking(path)
    idx, vect = build_index(chunks)
    return {
        "message": "File uploaded and processed successfully.",
        "n_chunks": len(chunks),
        "vector_dim": len(vect.vocabulary_)
    }

#quiz gen
@app.post("/quiz/")
async def quiz(
    file: UploadFile = File(...),
    n_questions: int = Form(5),
    question_type: str = Form("mcq")  
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        path = tmp.name

    chunks = chunking(path)
    idx, vect = build_index(chunks)

    questions = []
    used = set()

    for _ in range(min(n_questions * 2, len(chunks))):  
        i = random.randrange(len(chunks))
        if i in used:
            continue
        used.add(i)

        content = chunks[i]

        try:
            if question_type == "mcq":
                out = mcq_chain.invoke({"content": content})["text"]
                parsed = mcq_parser.parse(out)
                question_obj = {
                    "id": str(uuid.uuid4())[:8],
                    "question": parsed.get("question"),
                    "type": "mcq",
                    "options": [
                        parsed.get("option_a"),
                        parsed.get("option_b"),
                        parsed.get("option_c"),
                        parsed.get("option_d"),
                    ],
                    "correctAnswer": parsed.get("correct_answer"),
                    "explanation": parsed.get("explanation"),
                    "difficulty": parsed.get("difficulty")
                }

            elif question_type == "short_answer":
                out = short_chain.invoke({"content": content})["text"]
                parsed = short_parser.parse(out)
                question_obj = {
                    "id": str(uuid.uuid4())[:8],
                    "question": parsed.get("question"),
                    "type": "short_answer",
                    "options": [],
                    "correctAnswer": parsed.get("correct_answer"),
                    "explanation": parsed.get("explanation"),
                    "difficulty": parsed.get("difficulty")
                }

            else:
                continue  

            questions.append(question_obj)

            if len(questions) >= n_questions:
                break

        except Exception as e:
            print("Parsing error:", e)

    return {"questions": questions}
