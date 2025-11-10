# YVI Assistant - AI Chatbot Platform

YVI Assistant is a modern AI chatbot platform built with React (TypeScript) frontend and Flask backend, integrated with Supabase for dynamic knowledge management. The application is ready for deployment on Netlify (frontend) and Render (backend).

## Project Structure

```
YVI TECH Assistant/
├── frontend/           # React TypeScript application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── index.html      # Entry point
├── backend/            # Flask Python application
│   ├── app.py          # Main application
│   ├── supabase_client.py # Supabase integration
│   └── templates/      # HTML templates
├── DEPLOYMENT_GUIDE.md # Deployment instructions
└── render.yaml         # Render deployment config
```

## Features

- **Modern Chat Interface**: Clean, responsive UI with dark/light theme support
- **AI-Powered Responses**: Context-aware answers from company knowledge base
- **Supabase Integration**: Dynamic knowledge management and chat logging
- **Multi-Platform Deployment**: Netlify for frontend, Render for backend
- **Real-time Analytics**: Chat interaction tracking and insights
- **Mobile-Optimized**: Fully responsive design for all devices
- **Voice Input Support**: Microphone integration for voice messages
- **Export Functionality**: Share and export conversation histories

## Technologies Used

### Frontend
- React with TypeScript
- Vite build tool
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Lucide React for icons

### Backend
- Flask (Python)
- Supabase (PostgreSQL)
- python-dotenv for environment management
- Flask-CORS for cross-origin requests

### Deployment
- Netlify (Frontend)
- Render (Backend)
- GitHub for version control

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.7+
- Supabase account

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Create .env file with Supabase credentials
python app.py
```

### Environment Variables
Create a `.env` file in the backend directory:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000  # For local development
```

## Supabase Database Schema

### chatbot_knowledge
```sql
CREATE TABLE chatbot_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT,
  title TEXT,
  keywords TEXT[],
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### chatbot_logs
```sql
CREATE TABLE chatbot_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query TEXT,
  bot_response TEXT,
  matched_category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Frontend (Netlify)
1. Build the React app: `npm run build` in the frontend directory
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard if needed

### Backend (Render)
1. Connect your GitHub repository to Render
2. Render will automatically use the `render.yaml` configuration
3. Set environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `FRONTEND_URL` (your Netlify URL)

## API Endpoints

- `GET /` - Serve the chatbot interface
- `POST /chat` - Process chat messages and return responses
- `GET /health` - Health check endpoint

## Development

The application uses a dual-server setup during development:
- Frontend runs on http://localhost:3000 (Vite)
- Backend runs on http://localhost:5000 (Flask)
- API requests are proxied from frontend to backend

## Customization

- Modify knowledge base data in Supabase dashboard
- Update UI components in `frontend/src/components/`
- Extend backend functionality in `backend/app.py`
- Modify styling in `frontend/src/index.css` and Tailwind config

## License

This project is proprietary to YVI Tech Solutions. All rights reserved.