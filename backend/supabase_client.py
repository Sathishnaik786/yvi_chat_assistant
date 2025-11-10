import os

# Handle potential import issues gracefully
try:
    from supabase import create_client, Client  # type: ignore
except ImportError:
    create_client = None
    Client = None
    
try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:
    def load_dotenv():
        pass

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client (None if credentials are missing)
supabase = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://your-supabase-project.supabase.co":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if create_client else None
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        supabase = None
else:
    print("Supabase credentials not configured. Using static knowledge base.")

def get_knowledge_entry(query: str):
    """
    Search for a knowledge entry by title or keywords
    """
    # Return None if Supabase is not configured
    if supabase is None:
        return None
        
    try:
        # First try exact match on title
        response = supabase.table("chatbot_knowledge").select("*").eq("title", query).execute()
        if response.data:
            return response.data[0]
        
        # Then try partial match on title
        response = supabase.table("chatbot_knowledge").select("*").ilike("title", f"%{query}%").execute()
        if response.data:
            return response.data[0]
        
        # Finally try keyword matching
        response = supabase.table("chatbot_knowledge").select("*").contains("keywords", [query]).execute()
        if response.data:
            return response.data[0]
            
        return None
    except Exception as e:
        print(f"Error fetching knowledge entry: {e}")
        return None

def get_all_categories() -> list:
    """
    Get all unique categories from the knowledge base
    """
    # Return empty list if Supabase is not configured
    if supabase is None:
        return []
        
    try:
        response = supabase.table("chatbot_knowledge").select("category").execute()
        categories = list(set([item["category"] for item in response.data]))
        return categories
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return []

def get_category_entries(category: str) -> list:
    """
    Get all entries for a specific category
    """
    # Return empty list if Supabase is not configured
    if supabase is None:
        return []
        
    try:
        response = supabase.table("chatbot_knowledge").select("*").eq("category", category).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching category entries: {e}")
        return []

def log_chat_interaction(user_query: str, bot_response: str, matched_category = None):
    """
    Log chat interactions for analytics
    """
    # Return if Supabase is not configured
    if supabase is None:
        return
        
    try:
        supabase.table("chatbot_logs").insert({
            "user_query": user_query,
            "bot_response": bot_response,
            "matched_category": matched_category
        }).execute()
    except Exception as e:
        print(f"Error logging chat interaction: {e}")

def initialize_knowledge_base():
    """
    Initialize the knowledge base with sample data if empty
    """
    # Return if Supabase is not configured
    if supabase is None:
        return
        
    try:
        # Check if knowledge base is empty
        response = supabase.table("chatbot_knowledge").select("id").limit(1).execute()
        if not response.data:
            # Insert sample data
            sample_data = [
                {
                    "category": "About",
                    "title": "About Us",
                    "keywords": ["about", "company", "info"],
                    "description": "YVI Tech Solutions is a technology company delivering IT consulting, software development, and digital solutions tailored for enterprises worldwide."
                },
                {
                    "category": "Contact",
                    "title": "Contact",
                    "keywords": ["contact", "email", "phone", "location"],
                    "description": "Email📧: info@yvisoft.com\n\nPhone📞: +91-8317622417\n\nLocation📍: Flat No-401, Sri Ranga Garden View, Hig 140, Miyapur, Hyderabad, Tirumalagiri, Telangana, India, 500049"
                },
                {
                    "category": "Services",
                    "title": "IT Consulting",
                    "keywords": ["consulting", "strategy", "IT"],
                    "description": "Our experts can help to develop and implement an effective IT strategy, assist in smooth digital transformation and system integration, as well as advise on improvements to your digital customer experience."
                },
                {
                    "category": "Core Capabilities",
                    "title": "Oracle HCM",
                    "keywords": ["oracle", "hcm", "hrms"],
                    "description": "Oracle Human Capital Management:\n\nOur expertise is in supporting organizations with the deployment of comprehensive talent and HR solutions. We address all aspects, from strategic planning to daily operations, with a focus on delivering customized experiences and promoting human-centered engagement.\n\nSolutions We Offer:\n- Oracle Human Resources (Core HR, Onboarding, Benefits, Absence management, Workforce directory, HR help desk, Work-life solutions, Workforce modeling)\n- Oracle Talent Management (Performance, Compensation, Learning, Succession)\n- Oracle Recruiting (Candidate Engagement, Hiring, Onboarding, Analytics)\n- Oracle Workforce Management (Time & Labor, Planning, Health & Safety, Absences)\n- Oracle Payroll (Global Payroll, Payroll Interface, Tax Reporting)\n- Oracle HCM Analytics (Dashboards, KPIs, Retention, Attrition analysis)\n- Oracle HR Helpdesk (Service request management, Privacy, Analytics)\n\nEach of these modules is designed to streamline HR processes, improve decision-making, and enhance employee experiences across organizations."
                }
            ]
            
            supabase.table("chatbot_knowledge").insert(sample_data).execute()
            print("Sample knowledge base data inserted successfully")
    except Exception as e:
        print(f"Error initializing knowledge base: {e}")