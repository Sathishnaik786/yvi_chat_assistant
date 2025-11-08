from flask import Flask, render_template, request, jsonify, send_from_directory  # type: ignore
import os

# Handle potential import issues gracefully
try:
    from flask_cors import CORS  # type: ignore
except ImportError:
    CORS = None
    
from supabase_client import supabase, get_knowledge_entry, get_all_categories, get_category_entries, log_chat_interaction

app = Flask(__name__)

# Enable CORS for development
if CORS:
    CORS(app, origins=["http://localhost:8080", "http://127.0.0.1:8080"])

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
        for item in response.data:
            # Create key from title (lowercase, no special characters)
            key = item["title"].lower().strip()
            knowledge_base[key] = {
                "title": item["title"],
                "answer": item["description"]
            }
        print(f"Loaded {len(knowledge_base)} entries from Supabase")
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
    message = data.get("message", "").strip().lower()

    # Log user query
    log_chat_interaction(message, "", "chat_request")
    
    # Normalize synonyms
    for key in synonyms:
        if message == key.lower():
            message = synonyms[key]

    # ✅ First try to fetch from Supabase
    try:
        supabase_entry = get_knowledge_entry(message)
        if supabase_entry:
            response_data = {
                "reply": supabase_entry["description"]
            }
            # Log successful response
            log_chat_interaction(message, response_data["reply"], supabase_entry["category"])
            return jsonify(response_data)
    except Exception as e:
        print(f"Error querying Supabase: {e}")

    # ✅ If we get here, no match was found in Supabase
    response_data = {
        "reply": "Sorry, I don't have information about that topic. Please ask about Our Services, Core Capabilities, Other Capabilities, Our Process, About Us, Contact, or Location."
    }
    log_chat_interaction(message, response_data["reply"], "no_match")
    return jsonify(response_data)

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
            "response": "YVI Soft Solutions is a leading IT consulting firm specializing in enterprise solutions.",
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
    # Set environment variable for development
    os.environ['FLASK_ENV'] = 'development'
    app.run(debug=True, port=5000)