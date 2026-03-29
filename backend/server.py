from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import pdfplumber
import google.genai as genai
import json
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyzeRequest(BaseModel):
    text: str
    api_key: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    api_key: str
    study_material: Optional[str] = None

# Helper function to clean and parse JSON
def clean_json_response(text: str) -> dict:
    """Extract JSON from AI response and parse it"""
    # Look for JSON patterns in the response
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    
    # Fallback: try to parse the entire response as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # If all else fails, return a basic structure
        return {
            "title": "Study Material",
            "topics": [{"name": "Overview", "summary": text[:500], "keyPoints": [text[:200]]}],
            "mindmap": {"root": "Main Topic", "branches": []},
            "quiz": []
        }

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "StudyTime AI Backend - Ready"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload PDF and extract text"""
    try:
        # Check if file is PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read file content
        content = await file.read()
        
        # Extract text using pdfplumber
        import io
        pdf_file = io.BytesIO(content)
        
        text = ""
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from PDF")
        
        return {
            "success": True,
            "filename": file.filename,
            "text": text.strip(),
            "page_count": len(pdf.pages) if 'pdf' in locals() else 0
        }
        
    except Exception as e:
        logging.error(f"PDF upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@api_router.post("/analyze")
async def analyze_text(request: AnalyzeRequest):
    """Analyze text using Gemini AI"""
    try:
        # Initialize Gemini with provided API key
        client = genai.Client(api_key=request.api_key)
        
        prompt = f"""
Analyze the following study material and provide a structured JSON response with:
1. A title for the material
2. Main topics with summaries and key points
3. A mind map structure with root, branches, and children
4. Quiz questions with different difficulty levels (easy, medium, hard)

Study Material:
{request.text[:10000]}  # Limit text length

Respond with valid JSON only:
{{
  "title": "Material Title",
  "topics": [
    {{
      "name": "Topic Name",
      "summary": "Topic summary",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }}
  ],
  "mindmap": {{
    "root": "Main Concept",
    "branches": [
      {{
        "label": "Branch Name",
        "children": ["Child 1", "Child 2"]
      }}
    ]
  }},
  "quiz": [
    {{
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "difficulty": "medium",
      "topic": "Topic Name"
    }}
  ]
}}
"""
        
        # Get response from Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        response_text = response.text
        
        # Clean and parse the response
        analysis_data = clean_json_response(response_text)
        
        return {
            "success": True,
            "data": analysis_data
        }
        
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze text: {str(e)}")

@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI about study material"""
    try:
        # Initialize Gemini with provided API key
        client = genai.Client(api_key=request.api_key)
        
        # Save user message to chat history
        user_message = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.message
        )
        user_doc = user_message.model_dump()
        user_doc['timestamp'] = user_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(user_doc)
        
        # Create context-aware prompt
        context = ""
        if request.study_material:
            context = f"\nStudy Material Context:\n{request.study_material[:2000]}\n"
        
        prompt = f"""You are a helpful AI tutor assisting with study material. 
Answer the student's question based on the provided context and your knowledge.
Be helpful, educational, and concise.{context}

Student Question: {request.message}

Provide a clear, educational response:"""
        
        # Get response from Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        response_text = response.text
        
        # Save assistant response to chat history
        assistant_message = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=response_text
        )
        assistant_doc = assistant_message.model_dump()
        assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(assistant_doc)
        
        return {
            "success": True,
            "message": response_text
        }
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

@api_router.get("/chat/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        # Get all messages for this session, sorted by timestamp
        messages = await db.chat_messages.find(
            {"session_id": session_id}, 
            {"_id": 0}
        ).sort("timestamp", 1).to_list(1000)
        
        # Convert ISO timestamps back to datetime objects
        for msg in messages:
            if isinstance(msg['timestamp'], str):
                msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
        
        return messages
        
    except Exception as e:
        logging.error(f"Chat history error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chat history: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)

