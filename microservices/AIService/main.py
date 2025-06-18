from fastapi import FastAPI, File, UploadFile, Form, Response
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import random
import uuid
import time
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
import faiss
import numpy as np
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")  # Update the key name if needed

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",  # or "gemini-1.5-pro", "gemini-1.5-flash"
    google_api_key=GEMINI_API_KEY
)


# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# Helper functions

def chunking(path, start_page=1, end_page=None, chunk_size=800, chunk_overlap=200):
    """
    Split PDF content into chunks.
    
    Args:
        path: Path to PDF file
        start_page: Starting page number
        end_page: Ending page number
        chunk_size: Size of each chunk
        chunk_overlap: Overlap between chunks
        
    Returns:
        list: List of Document objects
    """
    try:
        documents = []
        pdf = PdfReader(path)
        total_pages = len(pdf.pages)
        
        # Validate page numbers
        if start_page < 1:
            start_page = 1
        if end_page is None or end_page > total_pages:
            end_page = total_pages
        if start_page > end_page:
            return []

        for page_num in range(start_page - 1, end_page):
            page = pdf.pages[page_num]
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
    
    except Exception as e:
        error_msg = f"Error in chunking: {str(e)}"
        print(error_msg)
        return []

def build_index(chunks):
    """
    Build FAISS index from chunks.
    
    Args:
        chunks: List of Document objects
        
    Returns:
        tuple: (index, vectorizer)
    """
    try:
        # Extract text content from chunks
        texts = [doc.page_content for doc in chunks]
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform(texts)
        
        # Convert to dense numpy array
        dense_vectors = vectors.toarray().astype('float32')
        
        # Build FAISS index
        index = faiss.IndexFlatL2(dense_vectors.shape[1])
        index.add(dense_vectors)
        
        return index, vectorizer
        
    except Exception as e:
        error_msg = f"Error building index: {str(e)}"
        print(error_msg)
        return None, None

def build_mcq_chain():
    """
    Build MCQ generation chain.
    
    Returns:
        tuple: (chain, parser)
    """
    try:
        schemas = [
            ResponseSchema(name="question", description="The MCQ question text"),
            ResponseSchema(name="option_a", description="Option A"),
            ResponseSchema(name="option_b", description="Option B"),
            ResponseSchema(name="option_c", description="Option C"),
            ResponseSchema(name="option_d", description="Option D"),
            ResponseSchema(name="correct_answer", description="Correct option letter (A/B/C/D)"),
            ResponseSchema(name="explanation", description="1-2 line explanation"),
            ResponseSchema(name="difficulty", description="Difficulty: easy, medium, hard")
        ]
        parser = StructuredOutputParser.from_response_schemas(schemas)

        prompt = PromptTemplate(
            input_variables=["content"],
            template="""
You are an AI service that generates Multiple Choice Questions (MCQs) from educational text.

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
    except Exception as e:
        print(f"Error building MCQ chain: {str(e)}")
        raise

def build_short_answer_chain():
    """
    Build short answer question generation chain.
    
    Returns:
        tuple: (chain, parser)
    """
    try:
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
You are an AI service that generates Short Answer Questions from educational text.

From the content below, create ONE short-answer (descriptive) question.
- Do not generate options.
- Provide a correct answer as a sentence.
- Add a short explanation and difficulty level.
- You should not say based on the content, but rather generate a question that can be answered by the content.

Content:
{content}

{format_instructions}
""",
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )

        return LLMChain(prompt=prompt, llm=llm), parser
    except Exception as e:
        print(f"Error building short answer chain: {str(e)}")
        raise

# Initialize chains
mcq_chain, mcq_parser = build_mcq_chain()
short_chain, short_parser = build_short_answer_chain()

# Upload endpoint
@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    """
    Upload a PDF file and return its total number of pages.
    
    Args:
        file: PDF file to upload
        
    Returns:
        dict: Contains success message and total pages
    """
    try:
        # Save uploaded PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            path = tmp.name

        try:
            reader = PdfReader(path)
            total_pages = len(reader.pages)
            
            return {
                "message": "File uploaded successfully.",
                "total_pages": total_pages
            }
            
        except Exception as e:
            error_msg = f"Failed to read PDF: {str(e)}"
            print(error_msg)
            return {"error": error_msg}
            
    except Exception as e:
        error_msg = f"Upload failed: {str(e)}"
        print(error_msg)
        return {"error": error_msg}
        
    finally:
        if 'path' in locals():
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error removing temporary file: {str(e)}")

# Quiz generation endpoint
@app.post("/quiz/")
async def quiz(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int = Form(None),
    num_questions: int = Form(5),
    question_type: str = Form("mcq")  # "mcq" or "short_answer"
):
    """
    Generate quiz questions from a PDF file.
    
    Args:
        file: PDF file to process
        start_page: Starting page number
        end_page: Ending page number
        num_questions: Number of questions to generate
        question_type: Type of questions ("mcq" or "short_answer")
        
    Returns:
        dict: Contains generated questions
    """
    try:
        # Validate inputs
        if start_page < 1:
            return {"error": "Start page must be at least 1"}
        if end_page is not None and start_page > end_page:
            return {"error": "Start page cannot be greater than end page"}
        if num_questions < 1 or num_questions > 20:
            return {"error": "Number of questions must be between 1 and 20"}
        if question_type not in ["mcq", "short_answer"]:
            return {"error": "Question type must be 'mcq' or 'short_answer'"}

        # Save uploaded PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            path = tmp.name

        try:
            # Process PDF and generate chunks
            chunks = chunking(path, start_page, end_page)
            
            if not chunks:
                return {"error": "No content found in the specified pages"}
            
            # Generate questions
            questions = []
            selected_chunks = random.sample(chunks, min(num_questions, len(chunks)))
            
            for chunk in selected_chunks:
                try:
                    if question_type == "mcq":
                        response = mcq_chain.run(content=chunk.page_content)
                        parsed_response = mcq_parser.parse(response)
                    else:  # short_answer
                        response = short_chain.run(content=chunk.page_content)
                        parsed_response = short_parser.parse(response)
                    
                    # Add metadata
                    parsed_response["source_page"] = chunk.metadata.get("page", "Unknown")
                    questions.append(parsed_response)
                    
                except Exception as e:
                    print(f"Error generating question from chunk: {str(e)}")
                    continue
            
            if not questions:
                return {"error": "Failed to generate any questions"}
            
            return {
                "questions": questions,
                "total_questions": len(questions),
                "question_type": question_type,
                "pages_processed": {"start": start_page, "end": end_page or "end"}
            }
            
        except Exception as e:
            error_msg = f"Error processing PDF: {str(e)}"
            print(error_msg)
            return {"error": error_msg}
            
    except Exception as e:
        error_msg = f"Quiz generation failed: {str(e)}"
        print(error_msg)
        return {"error": error_msg}
        
    finally:
        if 'path' in locals():
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error removing temporary file: {str(e)}")

# Study notes generation endpoint
@app.post("/generate-study-notes/")
async def generate_study_notes(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int = Form(None)
):
    """
    Generate study notes from a PDF file.
    
    Args:
        file: PDF file to process
        start_page: Starting page number
        end_page: Ending page number
        
    Returns:
        dict: Contains generated notes and processed pages
    """
    try:
        # Validate page numbers
        if start_page < 1:
            return {"error": "Start page must be at least 1"}
        if end_page is not None and start_page > end_page:
            return {"error": "Start page cannot be greater than end page"}

        # Save uploaded PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            path = tmp.name

        try:
            # Read PDF content from specified pages
            all_text = ""
            reader = PdfReader(path)
            total_pages = len(reader.pages)
            
            if end_page is None:
                end_page = total_pages
            elif end_page > total_pages:
                end_page = total_pages

            for page in range(start_page-1, end_page):
                if page < len(reader.pages):
                    content = reader.pages[page].extract_text()
                    if content:
                        content = ' '.join(content.replace('\n\n\n', '\n\n').split())
                        all_text += content + "\n\n"

            if not all_text.strip():
                return {"error": "No readable content found in the specified pages."}

            # Prompt to send to LLM
            prompt = f"""
Generate a formal study note for students in a classroom setting based on the following topic content:
- Use clear headings and bullet points.
- The tone should be academic and student-friendly.
- Include key concepts, definitions, and important points.
- Focus on pages {start_page} to {end_page} of the document.

Content:
{all_text}
"""

            # Call your LLM (Gemini/OpenAI/etc.)
            response = llm.invoke(prompt)
            notes = response.content.strip() if hasattr(response, "content") else str(response).strip()

            return {
                "notes": notes,
                "length": len(notes.split()),
                "pages_processed": {"start": start_page, "end": end_page}
            }
            
        except Exception as e:
            error_msg = f"Error processing PDF: {str(e)}"
            print(error_msg)
            return {"error": error_msg}
            
    except Exception as e:
        error_msg = f"Upload failed: {str(e)}"
        print(error_msg)
        return {"error": error_msg}
        
    finally:
        if 'path' in locals():
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error removing temporary file: {str(e)}")

@app.post("/short-questions/")
async def generate_all_short_questions(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int = Form(None)
):
    """
    Generate all possible short questions from a PDF file with page selection.
    
    Args:
        file: PDF file to process
        start_page: Starting page number (default: 1)
        end_page: Ending page number (default: None - processes till end)
        
    Returns:
        Response: Text/markdown content with numbered questions
    """
    try:
        # Validate page numbers
        if start_page < 1:
            return {"error": "Start page must be at least 1"}
        if end_page is not None and start_page > end_page:
            return {"error": "Start page cannot be greater than end page"}

        # Save uploaded PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            path = tmp.name

        try:
            # Process PDF with page selection
            chunks = chunking(path, start_page, end_page)
            
            if not chunks:
                return {"error": "No content found in the specified pages"}
            
            question_list = []
            start_time = time.time()
            TIME_LIMIT = 60  # seconds

            for i, chunk in enumerate(chunks):
                if time.time() - start_time >= TIME_LIMIT:
                    print("Time limit reached. Stopping early.")
                    break

                try:
                    out = short_chain.invoke({"content": chunk.page_content})["text"]
                    parsed = short_parser.parse(out)

                    question_text = parsed.get("question")
                    if question_text:
                        # Include source page information
                        source_page = chunk.metadata.get("page", "Unknown")
                        question_list.append(f"{len(question_list) + 1}. {question_text.strip()} (Page {source_page})")
                        print(f"Chunk {i}: {question_text.strip()} (Page {source_page})")

                except Exception as e:
                    print(f"Error on chunk {i}: {e}")
                    continue

            if not question_list:
                return {"error": "Failed to generate any questions from the specified pages"}

            # Add header with page information
            header = f"# Short Answer Questions\n**Pages {start_page} to {end_page or 'end'}**\n\n"
            full_text = header + "\n".join(question_list)

            return Response(content=full_text, media_type="text/markdown")

        except Exception as e:
            error_msg = f"Error processing PDF: {str(e)}"
            print(error_msg)
            return {"error": error_msg}
            
    except Exception as e:
        error_msg = f"Short questions generation failed: {str(e)}"
        print(error_msg)
        return {"error": error_msg}
        
    finally:
        if 'path' in locals():
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error removing temporary file: {str(e)}")
# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "PDF Processing API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "openai_configured": bool(OPENAI_API_KEY),
        "endpoints": ["/upload/", "/quiz/", "/generate-study-notes/"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)