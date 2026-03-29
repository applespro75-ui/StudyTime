#!/usr/bin/env python3
"""
StudyTime AI Backend Test Suite
Tests all API endpoints with the provided Gemini API key
"""

import asyncio
import aiohttp
import json
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Configuration
BACKEND_URL = "http://localhost:8001"
API_KEY = "YOUR_GEMINI_API_KEY_HERE" # Replace with your own key for testing

# Test data
SAMPLE_TEXT = """
Python Programming - Complete Guide

Python is a high-level, interpreted programming language known for its simplicity and readability. 
Created by Guido van Rossum and first released in 1991, Python has become one of the most 
popular programming languages in the world.

Key Features of Python:
1. Simple and Easy to Learn - Python has a clean, readable syntax that makes it ideal for beginners
2. Versatile - Can be used for web development, data science, machine learning, automation, and more
3. Large Community - Extensive documentation and community support
4. Rich Standard Library - Built-in modules for various tasks
5. Cross-Platform - Runs on Windows, macOS, and Linux

Python Data Types:
- Integers (int): Whole numbers like 42, -7, 0
- Floats (float): Decimal numbers like 3.14, -2.5, 0.0
- Strings (str): Text data enclosed in quotes
- Lists (list): Ordered collections of items
- Dictionaries (dict): Key-value pairs
- Tuples (tuple): Immutable ordered sequences
- Sets (set): Unordered collections of unique items

Control Flow:
Python supports standard control flow structures like if-else statements, for loops, and while loops. 
The indentation-based syntax makes code more readable and consistent.

Functions and Classes:
Python allows defining functions using the 'def' keyword and classes using the 'class' keyword. 
Object-oriented programming is fully supported with inheritance, polymorphism, and encapsulation.

Popular Python Libraries:
- NumPy: Numerical computing
- Pandas: Data manipulation and analysis
- Django/Flask: Web frameworks
- TensorFlow/PyTorch: Machine learning
- Matplotlib/Seaborn: Data visualization
"""

def create_test_pdf():
    """Create a simple PDF for testing"""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica", 12)
    
    text_lines = SAMPLE_TEXT.split('\n')
    y_position = 750
    
    for line in text_lines:
        if y_position < 50:
            p.showPage()
            y_position = 750
        p.drawString(50, y_position, line[:80])  # Truncate long lines
        y_position -= 15
    
    p.save()
    buffer.seek(0)
    return buffer

async def test_backend():
    """Test all backend endpoints"""
    print("🧪 StudyTime AI Backend Test Suite")
    print("=" * 50)
    
    async with aiohttp.ClientSession() as session:
        results = []
        
        # Test 1: Root endpoint
        print("\n1. Testing Root Endpoint...")
        try:
            async with session.get(f"{BACKEND_URL}/api/") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"   ✅ Root endpoint: {data.get('message', 'OK')}")
                    results.append(("Root Endpoint", True, None))
                else:
                    print(f"   ❌ Root endpoint failed: {resp.status}")
                    results.append(("Root Endpoint", False, f"Status: {resp.status}"))
        except Exception as e:
            print(f"   ❌ Root endpoint error: {str(e)}")
            results.append(("Root Endpoint", False, str(e)))
        
        # Test 2: PDF Upload
        print("\n2. Testing PDF Upload...")
        try:
            pdf_buffer = create_test_pdf()
            pdf_data = pdf_buffer.getvalue()
            
            form_data = aiohttp.FormData()
            form_data.add_field('file', pdf_data, 
                             filename='test_python_guide.pdf',
                             content_type='application/pdf')
            
            async with session.post(f"{BACKEND_URL}/api/upload", data=form_data) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get('success'):
                        print(f"   ✅ PDF uploaded: {data.get('filename')}")
                        print(f"   📄 Extracted {len(data.get('text', ''))} characters")
                        extracted_text = data.get('text', '')
                        results.append(("PDF Upload", True, None))
                    else:
                        print(f"   ❌ PDF upload failed: {data}")
                        results.append(("PDF Upload", False, str(data)))
                else:
                    error_text = await resp.text()
                    print(f"   ❌ PDF upload failed: {resp.status} - {error_text}")
                    results.append(("PDF Upload", False, f"Status: {resp.status}"))
        except Exception as e:
            print(f"   ❌ PDF upload error: {str(e)}")
            results.append(("PDF Upload", False, str(e)))
        
        # Test 3: Text Analysis with Gemini
        print("\n3. Testing Text Analysis...")
        try:
            payload = {
                "text": SAMPLE_TEXT,
                "api_key": API_KEY
            }
            
            async with session.post(f"{BACKEND_URL}/api/analyze", json=payload) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get('success'):
                        analysis = data.get('data', {})
                        print(f"   ✅ Analysis successful")
                        print(f"   📚 Title: {analysis.get('title', 'N/A')}")
                        print(f"   📝 Topics: {len(analysis.get('topics', []))}")
                        print(f"   🗺️ Mind map branches: {len(analysis.get('mindmap', {}).get('branches', []))}")
                        print(f"   🧩 Quiz questions: {len(analysis.get('quiz', []))}")
                        results.append(("Text Analysis", True, None))
                    else:
                        print(f"   ❌ Analysis failed: {data}")
                        results.append(("Text Analysis", False, str(data)))
                else:
                    error_text = await resp.text()
                    print(f"   ❌ Analysis failed: {resp.status} - {error_text}")
                    results.append(("Text Analysis", False, f"Status: {resp.status} - {error_text[:100]}"))
        except Exception as e:
            print(f"   ❌ Analysis error: {str(e)}")
            results.append(("Text Analysis", False, str(e)))
        
        # Test 4: Chat Functionality
        print("\n4. Testing Chat Functionality...")
        try:
            session_id = "test_session_12345"
            chat_payload = {
                "message": "What are the main features of Python according to the text?",
                "session_id": session_id,
                "api_key": API_KEY,
                "study_material": SAMPLE_TEXT[:1000]  # Send truncated text as context
            }
            
            async with session.post(f"{BACKEND_URL}/api/chat", json=chat_payload) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    if data.get('success'):
                        response = data.get('message', '')
                        print(f"   ✅ Chat successful")
                        print(f"   💬 Response length: {len(response)} characters")
                        print(f"   📝 Response preview: {response[:100]}...")
                        results.append(("Chat", True, None))
                    else:
                        print(f"   ❌ Chat failed: {data}")
                        results.append(("Chat", False, str(data)))
                else:
                    error_text = await resp.text()
                    print(f"   ❌ Chat failed: {resp.status} - {error_text}")
                    results.append(("Chat", False, f"Status: {resp.status} - {error_text[:100]}"))
        except Exception as e:
            print(f"   ❌ Chat error: {str(e)}")
            results.append(("Chat", False, str(e)))
        
        # Test 5: Chat History
        print("\n5. Testing Chat History...")
        try:
            session_id = "test_session_12345"
            async with session.get(f"{BACKEND_URL}/api/chat/{session_id}") as resp:
                if resp.status == 200:
                    messages = await resp.json()
                    print(f"   ✅ Chat history retrieved")
                    print(f"   💬 Messages found: {len(messages)}")
                    for i, msg in enumerate(messages[-2:]):  # Show last 2 messages
                        print(f"      {i+1}. {msg.get('role', 'unknown')}: {msg.get('content', '')[:50]}...")
                    results.append(("Chat History", True, None))
                else:
                    error_text = await resp.text()
                    print(f"   ❌ Chat history failed: {resp.status} - {error_text}")
                    results.append(("Chat History", False, f"Status: {resp.status}"))
        except Exception as e:
            print(f"   ❌ Chat history error: {str(e)}")
            results.append(("Chat History", False, str(e)))
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        passed = 0
        failed = 0
        
        for test_name, success, error in results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status} {test_name}")
            if not success and error:
                print(f"      Error: {error}")
            
            if success:
                passed += 1
            else:
                failed += 1
        
        print(f"\n📈 Total: {passed + failed} tests")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed == 0:
            print("\n🎉 All tests passed! Backend is ready for use.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please check the errors above.")
        
        return failed == 0

if __name__ == "__main__":
    print("Starting StudyTime AI Backend Tests...")
    print("Make sure the backend is running on http://localhost:8001")
    print("Using Gemini API Key: [HIDDEN/PROVIDED_IN_CODE]")
    print()
    
    result = asyncio.run(test_backend())
    exit(0 if result else 1)
