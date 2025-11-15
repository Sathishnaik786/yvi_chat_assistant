from flask import Flask, render_template, request, jsonify, send_from_directory  # type: ignore
import os
from difflib import SequenceMatcher

# Handle potential import issues gracefully
try:
    from flask_cors import CORS  # type: ignore
except ImportError:
    CORS = None
    
# Load environment variables
try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:
    def load_dotenv():
        pass
        
load_dotenv()

# Import requests
import requests  # type: ignore
    
from supabase_client import supabase, get_knowledge_entry, get_all_categories, get_category_entries, log_chat_interaction

app = Flask(__name__)

# Enable CORS for development and production
if CORS:
    # Allow localhost for development and Netlify for production
    cors_origins = [
        "http://localhost:8080", 
        "http://127.0.0.1:8080",
        "https://*.netlify.app",
        "https://yvichatbot.netlify.app"
    ]
    # If FRONTEND_URL is set (for production), add it to allowed origins
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        cors_origins.append(frontend_url)
    
    # Configure CORS with more explicit settings
    CORS(app, 
         origins=cors_origins,
         methods=["GET", "POST", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)

# ----------------------------
# Knowledge base (with YVI data in paragraph format)
# ----------------------------
# knowledge_base is now stored in Supabase

# Initialize knowledge base from Supabase
knowledge_base = {}

def load_knowledge_base():
    global knowledge_base
    # Check if Supabase is configured
    if supabase is None:
        print("Supabase not configured, loading static knowledge base")
        load_static_knowledge_base()
        return
        
    try:
        response = supabase.table("chatbot_knowledge").select("*").execute()
        if response and hasattr(response, 'data') and response.data:
            for item in response.data:
                # Create key from title (lowercase, no special characters)
                key = item["title"].lower().strip()
                knowledge_base[key] = {
                    "title": item["title"],
                    "answer": item["description"]
                }
            print(f"Loaded {len(knowledge_base)} entries from Supabase")
        else:
            print("No data received from Supabase")
            load_static_knowledge_base()
    except Exception as e:
        print(f"Error loading knowledge base: {e}")
        # Fallback to static knowledge base if Supabase fails
        load_static_knowledge_base()

# Empty static knowledge base - all data now comes from Supabase
static_knowledge_base = {}

# Load static knowledge base as fallback
def load_static_knowledge_base():
    global knowledge_base
    knowledge_base = static_knowledge_base.copy()
    print("Loaded static knowledge base as fallback - but this should not be used with Supabase configured")

# Load knowledge base on startup
load_knowledge_base()

# ----------------------------
# Synonyms
# ----------------------------
synonyms = {
    "cybersecurity service": "cybersecurity services",
    "infrastructure service": "infrastructure services",
    "data analytic": "data analytics",
    "oracle financial": "oracle financials",
    "rpa service": "rpa services",
    "mobile app development": "mobile development",
    "web app development": "web development"
}

# ----------------------------
# Chat endpoint
# ----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("message", "").strip()

    # 1️⃣ Search database
    search_result = search_database(user_query)

    if search_result:
        db_data = search_result["match"]
        context_text = db_data.get("description", "")
        confidence = search_result["confidence"]

        # 2️⃣ Enrich with Gemini
        enriched_reply = call_gemini_api(user_query, context_text)
        reply = enriched_reply
        source = "Enriched Hybrid"
    else:
        # 3️⃣ Fallback to Gemini
        reply = call_gemini_api(user_query)
        source = "AI Response"

    # 4️⃣ Log the chat
    matched_category = None
    if search_result:
        matched_category = search_result.get("match", {}).get("category")
    log_chat_interaction(user_query, reply, matched_category, source)

    return jsonify({
        "reply": reply
    })

# ----------------------------
# Chat Session Management Endpoints
# ----------------------------
@app.route("/api/chat-sessions/<session_id>", methods=["DELETE"])
def delete_chat_session(session_id):
    """Delete a chat session by ID"""
    try:
        # For now, we'll just return success since sessions are stored in localStorage
        # In a full implementation, this would delete from a database
        return jsonify({"success": True, "message": "Chat session deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ----------------------------
# Helper functions for hybrid response logic
# ----------------------------
def search_database(query: str):
    """Improved semantic fuzzy search on Supabase data."""
    if supabase is None:
        return None
        
    try:
        result = supabase.table("chatbot_knowledge").select("*").execute()
        if not result or not hasattr(result, 'data'):
            print("Invalid response from Supabase")
            return None
            
        best_match = None
        best_score = 0

        for item in result.data:
            combined = f"{item.get('title','')} {item.get('description','')}".lower()
            score = SequenceMatcher(None, query.lower(), combined).ratio()
            if score > best_score:
                best_score = score
                best_match = item

        if best_score > 0.1:
            return {"match": best_match, "confidence": round(best_score * 100, 1)}
        return None
    except Exception as e:
        print("Database search error:", e)
        return None

def call_gemini_api(prompt: str, context: str = "") -> str:
    """Call Gemini API with optional contextual enrichment."""
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not configured")
        
    system_prompt = (
        "You are YVI Technologies Assistant — an intelligent AI system for YVI Technologies, "
        "a global software and AI innovation company based in Hyderabad, India. "
        "Always introduce yourself as the YVI Technologies Assistant. "
        "If users mention YVI Soft Solutions, clarify that the company is now called YVI Technologies."
    )

    combined_prompt = f"{system_prompt}\n\n"
    if context:
        combined_prompt += f"Here is some relevant company data:\n{context}\n\n"
    combined_prompt += f"""
Always refer to the company as YVI Technologies.
If any previous version or old name appears (like YVI Soft Solutions),
clarify that it has been rebranded to YVI Technologies.

User: {prompt}
Assistant:
"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": combined_prompt}]}]}

        # Set timeout to 30 seconds to match frontend
        r = requests.post(url, headers=headers, json=payload, timeout=30)
        result = r.json()
        
        # Check if response has the expected structure
        if "candidates" in result and len(result["candidates"]) > 0 and "content" in result["candidates"][0] and "parts" in result["candidates"][0]["content"]:
            response = result["candidates"][0]["content"]["parts"][0]["text"]
            # Comprehensive post-processing to ensure correct company name
            # Handle various case variations
            import re
            response = re.sub(r'[Yy][Vv][Ii]\s*[Ss][Oo][Ff][Tt]\s*[Ss][Oo][Ll][Uu][Tt][Ii][Oo][Nn][Ss]', 'YVI Technologies', response)
            response = re.sub(r'[Yy][Vv][Ii]\s*[Ss][Oo][Ff][Tt]', 'YVI Technologies', response)
            # Handle extra spaces and variations
            response = response.replace("YVI Soft Solutions", "YVI Technologies")
            response = response.replace("YVI Soft", "YVI Technologies")
            response = response.replace("YVI soft solutions", "YVI Technologies")
            response = response.replace("YVI soft", "YVI Technologies")
            response = response.replace("YVI  Soft  Solutions", "YVI Technologies")  # Handle extra spaces
            response = response.replace("YVI  Soft", "YVI Technologies")  # Handle extra spaces
            response = response.replace("YVI Soft Solution", "YVI Technologies")  # Handle singular form
            response = response.replace("YVI Soft Solution's", "YVI Technologies'")  # Handle possessive form
            return response
        else:
            raise Exception("Unexpected API response structure")

    except requests.exceptions.Timeout:
        print("Gemini API timeout error")
        fallback_response = "The request is taking longer than expected. Please try a shorter question or try again later."
        return fallback_response
    except Exception as e:
        print("Gemini API error:", e)
        # Even in error cases, ensure we don't leak the wrong company name
        fallback_response = "I'm having trouble connecting to the AI service right now. Please try again shortly."
        return fallback_response

# ----------------------------
# Admin Dashboard Routes
# ----------------------------
@app.route("/admin")
def admin():
    return render_template("admin.html")

@app.route("/api/stats")
def api_stats():
    # Mock data for now - will be replaced with actual Supabase queries
    return jsonify({
        "totalChats": 124,
        "totalMessages": 342,
        "positiveFeedback": 89,
        "negativeFeedback": 12,
        "dailyActivity": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "data": [12, 19, 15, 17, 22, 30, 25]
        },
        "topCategories": {
            "labels": ["Services", "Capabilities", "Process", "About", "Contact"],
            "data": [45, 38, 27, 18, 15]
        }
    })

@app.route("/api/logs")
def api_logs():
    # Mock data for now - will be replaced with actual Supabase queries
    return jsonify([
        {
            "timestamp": "2023-06-15T10:30:00Z",
            "user_query": "What services do you offer?",
            "response": "We offer a comprehensive range of IT services including software development, cloud solutions, and cybersecurity services.",
            "category": "Services",
            "feedback": "positive"
        },
        {
            "timestamp": "2023-06-15T09:15:00Z",
            "user_query": "Tell me about Oracle HCM",
            "response": "Oracle HCM Cloud is a complete suite of applications for managing human resources.",
            "category": "Capabilities",
            "feedback": "positive"
        },
        {
            "timestamp": "2023-06-14T16:45:00Z",
            "user_query": "How does your development process work?",
            "response": "Our process includes requirements gathering, design, development, testing, and deployment phases.",
            "category": "Process",
            "feedback": "negative"
        },
        {
            "timestamp": "2023-06-14T14:20:00Z",
            "user_query": "Contact information?",
            "response": "You can reach us at contact@yvi.com or call us at +1-234-567-8900.",
            "category": "Contact",
            "feedback": None
        },
        {
            "timestamp": "2023-06-13T11:10:00Z",
            "user_query": "About your company",
            "response": "YVI Technologies is a leading IT consulting firm specializing in enterprise solutions.",
            "category": "About",
            "feedback": "positive"
        }
    ])

# ----------------------------
# Serve React Frontend
# ----------------------------
@app.route("/")
def index():
    # During development, proxy to React dev server
    # In production, serve from build directory
    if os.getenv('FLASK_ENV') == 'development':
        # Redirect to React dev server
        return '<script>window.location.href = "http://localhost:3000"</script>'
    else:
        # Serve production build
        return send_from_directory('build', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # During development, proxy to React dev server
    # In production, serve from build directory
    if os.getenv('FLASK_ENV') == 'development':
        # Redirect to React dev server
        return '<script>window.location.href = "http://localhost:3000/' + path + '"</script>'
    else:
        # Serve static files from the React build
        if os.path.exists(os.path.join('build', path)):
            return send_from_directory('build', path)
        else:
            # For any other route, serve index.html (for React Router)
            return send_from_directory('build', 'index.html')

if __name__ == "__main__":
    # Check if we're running on Render (production) or locally (development)
    if os.environ.get('FLASK_ENV') == 'production':
        # Use the PORT environment variable provided by Render
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        # Set environment variable for development
        os.environ['FLASK_ENV'] = 'development'
        app.run(debug=True, port=5000)