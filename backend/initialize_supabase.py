"""
Script to initialize Supabase tables with existing YVI Tech Solutions data
"""
import os
import sys
from supabase_client import supabase, initialize_knowledge_base

def create_sample_knowledge_data():
    """
    Create sample knowledge base data for Supabase
    """
    # Sample knowledge base data
    knowledge_data = [
        # About section
        {
            "category": "About",
            "title": "About Us",
            "keywords": ["about", "company", "info", "overview"],
            "description": "YVI Tech Solutions is a technology company delivering IT consulting, software development, and digital solutions tailored for enterprises worldwide."
        },
        {
            "category": "Contact",
            "title": "Contact",
            "keywords": ["contact", "email", "phone", "location", "address"],
            "description": "Email📧: info@yvisoft.com\n\nPhone📞: +91-8317622417\n\nLocation📍: Flat No-401, Sri Ranga Garden View, Hig 140, Miyapur, Hyderabad, Tirumalagiri, Telangana, India, 500049"
        },
        
        # Services
        {
            "category": "Services",
            "title": "IT Consulting",
            "keywords": ["consulting", "strategy", "IT", "digital transformation"],
            "description": "Our experts can help to develop and implement an effective IT strategy, assist in smooth digital transformation and system integration, as well as advise on improvements to your digital customer experience."
        },
        {
            "category": "Services",
            "title": "Software Development",
            "keywords": ["software", "development", "applications", "custom"],
            "description": "A software development firm committed to excellence, we specialize in creating reliable, scalable, and secure software solutions compatible with all operating systems, browsers, and devices. \n\nLeveraging extensive industry expertise and the latest technological advancements, we deliver customized solutions and products designed to meet the specific needs and behaviors of our clients' users."
        },
        {
            "category": "Services",
            "title": "Application Services",
            "keywords": ["application", "services", "maintenance", "support"],
            "description": "We help mid-sized and large firms build, test, protect, manage, migrate and optimize digital solutions. \n\nOur goal is to ensure they're always up and running and achieve the optimal total cost of ownership (TCO)."
        },
        {
            "category": "Services",
            "title": "UX/UI Design",
            "keywords": ["ux", "ui", "design", "user experience", "interface"],
            "description": "We deliver intuitive, vibrant, and impactful designs for websites, SaaS, and mobile apps. \n\nOur approach combines the latest UI/UX trends with client goals to deliver engaging user experiences that power up businesses."
        },
        {
            "category": "Services",
            "title": "Testing & QA",
            "keywords": ["testing", "qa", "quality assurance", "test"],
            "description": "We offer full-range QA and testing outsourcing services. \n\nOur team helps set up or enhance your QA practice, establish a TCoE, and perform end-to-end testing of mobile, web, and desktop applications at each stage of the development lifecycle."
        },
        {
            "category": "Services",
            "title": "Data Analytics",
            "keywords": ["data", "analytics", "business intelligence", "bi"],
            "description": "We support businesses in achieving fact-based decision-making by converting historical and real-time, traditional and big data into actionable insights. \n\nOur services strengthen businesses with advanced analytics capabilities, from BI dashboards to predictive modeling."
        },
        {
            "category": "Services",
            "title": "Infrastructure Services",
            "keywords": ["infrastructure", "cloud", "devops", "data center"],
            "description": "We ensure IT infrastructure reliability and scalability through managed services, cloud consulting, data center support, and DevOps integration. \n\nWe help businesses maintain a digital ecosystem that is fast, stable, and secure."
        },
        {
            "category": "Services",
            "title": "Cybersecurity Services",
            "keywords": ["cybersecurity", "security", "protection", "risk"],
            "description": "We employ ISO 27001 certified security practices to protect applications and networks. \n\nOur cybersecurity team ensures robust protection with proactive monitoring, risk assessment, and advanced defense mechanisms."
        },
        
        # Core Capabilities
        {
            "category": "Core Capabilities",
            "title": "Oracle HCM",
            "keywords": ["oracle", "hcm", "hrms", "human capital management"],
            "description": "Oracle Human Capital Management:\n\nOur expertise is in supporting organizations with the deployment of comprehensive talent and HR solutions. We address all aspects, from strategic planning to daily operations, with a focus on delivering customized experiences and promoting human-centered engagement.\n\nSolutions We Offer:\n- Oracle Human Resources (Core HR, Onboarding, Benefits, Absence management, Workforce directory, HR help desk, Work-life solutions, Workforce modeling)\n- Oracle Talent Management (Performance, Compensation, Learning, Succession)\n- Oracle Recruiting (Candidate Engagement, Hiring, Onboarding, Analytics)\n- Oracle Workforce Management (Time & Labor, Planning, Health & Safety, Absences)\n- Oracle Payroll (Global Payroll, Payroll Interface, Tax Reporting)\n- Oracle HCM Analytics (Dashboards, KPIs, Retention, Attrition analysis)\n- Oracle HR Helpdesk (Service request management, Privacy, Analytics)\n\nEach of these modules is designed to streamline HR processes, improve decision-making, and enhance employee experiences across organizations."
        },
        {
            "category": "Core Capabilities",
            "title": "Oracle SCM",
            "keywords": ["oracle", "scm", "supply chain management"],
            "description": "Oracle Supply Chain Management Resource:\n\nOur SCM solution integrates all aspects of your supply chain, from product conception to customer delivery, providing real-time visibility and enhancing efficiency across your organization.\n\nFeatures:\n- Unified SCM Platform\n- Advanced Analytics\n- Cloud-Based Flexibility\n\nModules:\n- Procurement Cloud\n- Logistics Cloud\n- Product Lifecycle Management Cloud\n- Supply Chain Planning Cloud\n- Manufacturing Cloud\n- Inventory Management Cloud\n\nBenefits:\n- Drive Operational Efficiency\n- Reduce Costs\n- Enhance Risk Management\n- Commit to Sustainability\n\nIntegration:\nOracle SCM integrates seamlessly with Oracle ERP, CRM, and HCM systems, as well as third-party platforms, ensuring smooth operations across the enterprise."
        },
        {
            "category": "Core Capabilities",
            "title": "Oracle Financials",
            "keywords": ["oracle", "financials", "erp", "finance"],
            "description": "Oracle Financials:\n\nA comprehensive suite designed to optimize financial management processes, support informed decision-making, and facilitate business growth.\n\nFeatures:\n- Complete Financial Management (General Ledger, AP, AR, Fixed Assets, Cash Management)\n- Advanced Financial Controls\n- Real-Time Analytics\n- Automation and Efficiency\n\nBenefits:\n- Drive Better Decisions\n- Increase Efficiency and Reduce Costs\n- Ensure Compliance\n- Scale for Growth\n\nIntegration:\nOracle Financials integrates smoothly with Oracle SCM, HCM, and other ERP systems, ensuring data consistency and holistic financial management."
        },
        {
            "category": "Core Capabilities",
            "title": "Other Core Capabilities",
            "keywords": ["oracle", "erp", "risk management", "project portfolio"],
            "description": "Oracle ERP provides a comprehensive suite of applications across multiple domains, including but not limited to HCM, SCM, and Financials.\n\nOther Oracle solutions include:\n- Oracle Risk Management Cloud\n- Oracle Project Portfolio Management Cloud\n- Oracle Enterprise Performance Management Cloud\n- Oracle Marketing Cloud\n- Oracle Sales Cloud\n- Oracle Service Cloud\n\nTogether, these enable organizations to manage risk, projects, finance, customer engagement, and services in a unified cloud ecosystem."
        },
        
        # Other Capabilities
        {
            "category": "Other Capabilities",
            "title": "Data & AI Solutions",
            "keywords": ["data", "ai", "artificial intelligence", "machine learning"],
            "description": "We transform systems into next-gen data platforms with services covering ingestion, storage, transformation, modeling, migration, and orchestration.\n\nWe also offer:\n- Machine Learning Applications\n- Business Intelligence\n- Automated Report Delivery\n- AI Advisory Services (LLM evaluation, RAG apps, AI assistants, agentic AI)\n- Enterprise Data Management (Data Quality, Catalogue, Governance, Security & Privacy)\n\nOur goal is to help businesses maximize the value of data and scale AI-driven insights effectively."
        },
        {
            "category": "Other Capabilities",
            "title": "RPA Services",
            "keywords": ["rpa", "robotic process automation", "automation"],
            "description": "We deliver advanced Robotic Process Automation (RPA) solutions to automate repetitive business processes.\n\nBenefits:\n- Reduce Operational Costs\n- Enhance Accuracy\n- Increase Productivity\n- Improve Customer Service\n- Scale Easily\n\nOur services include:\n- RPA Strategy and Consulting\n- RPA Implementation\n- Custom Automation Development\n- Continuous Maintenance & Support\n\nIndustries served include Finance, Healthcare, Manufacturing, and Retail."
        },
        {
            "category": "Other Capabilities",
            "title": "Digital Marketing",
            "keywords": ["digital marketing", "seo", "content", "campaigns"],
            "description": "Dizi Babu YVI Technologies, the digital division of YVI Tech, specializes in AI-powered digital marketing strategies.\n\nWe provide:\n- AI-Generated Content\n- Personalized Campaigns\n- Predictive Analytics\n- Automated SEO\n- Creative Asset Production\n\nWhy Choose Us:\n- Generative AI Expertise\n- Innovation-Driven\n- Scalable Solutions\n- Data-Driven Approach\n\nWe help businesses enhance engagement, improve ROI, and strengthen their digital presence."
        },
        {
            "category": "Other Capabilities",
            "title": "Web Development",
            "keywords": ["web", "development", "website", "frontend", "backend"],
            "description": "We provide full-stack web development services including:\n\n- Business Analysis\n- UX/UI Design\n- Architecture\n- Frontend & Backend Development\n- Integration\n- Testing & QA\n- Continuous Support\n\nOur solutions are modern, secure, scalable, and customized to business needs."
        },
        {
            "category": "Other Capabilities",
            "title": "Mobile Development",
            "keywords": ["mobile", "development", "app", "ios", "android"],
            "description": "We build cross-platform and native mobile apps for iOS and Android, modernize legacy apps, and optimize performance.\n\nServices include:\n- Concept Validation\n- Custom Mobile Development\n- App Modernization\n- Low-performing App Optimization\n\nTechnologies: iOS, Android, Hybrid, Enterprise Mobile Development."
        },
        
        # Process
        {
            "category": "Process",
            "title": "Requirements & Consulting",
            "keywords": ["requirements", "consulting", "planning"],
            "description": "We begin by learning your business processes, defining objectives, KPIs, and timelines. \n\nThis ensures a clear roadmap and a strong foundation for success."
        },
        {
            "category": "Process",
            "title": "Development",
            "keywords": ["development", "implementation", "coding"],
            "description": "We handle configuration, customization, and technical development required to automate your business processes with the right IT solutions."
        },
        {
            "category": "Process",
            "title": "Testing",
            "keywords": ["testing", "qa", "quality assurance"],
            "description": "We thoroughly test the system to ensure it meets requirements and delivers reliable, bug-free performance before release."
        },
        {
            "category": "Process",
            "title": "Release",
            "keywords": ["release", "deployment", "launch"],
            "description": "We roll out your solution and ensure smooth adoption with zero downtime strategies."
        },
        {
            "category": "Process",
            "title": "Enhancement & Maintenance",
            "keywords": ["enhancement", "maintenance", "support", "optimization"],
            "description": "After release, we continue to support, optimize, and enhance your system so it grows with your business and continues delivering value."
        }
    ]
    
    return knowledge_data

def initialize_supabase_tables():
    """
    Initialize Supabase tables with sample data
    """
    if supabase is None:
        print("Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY in .env file")
        return
    
    try:
        # Check if knowledge base is empty
        response = supabase.table("chatbot_knowledge").select("id").limit(1).execute()
        if not response.data:
            # Insert sample knowledge data
            knowledge_data = create_sample_knowledge_data()
            supabase.table("chatbot_knowledge").insert(knowledge_data).execute()
            print(f"Inserted {len(knowledge_data)} entries into chatbot_knowledge table")
        else:
            print("chatbot_knowledge table already contains data")
            
        # Check if logs table exists by trying to insert a test entry
        try:
            supabase.table("chatbot_logs").select("id").limit(1).execute()
            print("chatbot_logs table exists")
        except Exception:
            print("chatbot_logs table may need to be created in Supabase dashboard")
            
    except Exception as e:
        print(f"Error initializing Supabase tables: {e}")

if __name__ == "__main__":
    initialize_supabase_tables()