# YVI Chatbot

This is a chatbot application for YVI Soft Solutions built with React and Flask.

## Features

- Chat interface with AI assistant
- Integration with Supabase for knowledge base
- Modern UI with dark/light theme support
- Responsive design for all devices

## Technologies Used

- Frontend: React, TypeScript, Vite
- Backend: Flask (Python)
- Database: Supabase
- Styling: Tailwind CSS

## Setup

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Configure environment variables
4. Run the application

## Deployment

The application can be deployed to any platform that supports Python and Node.js applications.

## Features

- Dynamic chatbot responses fetched from Supabase database
- Static fallback knowledge base for when Supabase is not configured
- Chat interaction logging for analytics
- Responsive web interface with modals and quick buttons
- Loading indicators and typing effects

## Prerequisites

- Python 3.7+
- Flask
- Supabase account

## Installation

1. Clone the repository
2. Install required packages:
   ```bash
   pip install flask supabase python-dotenv
   ```

## Supabase Setup

1. Create a Supabase account at https://supabase.io
2. Create a new project
3. Get your Project URL and anon key from the API settings
4. Update the `.env` file with your credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

## Database Schema

Create the following tables in your Supabase database:

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

## Initialize Data

Run the initialization script to populate the knowledge base:
```bash
python initialize_supabase.py
```

## Running the Application

```bash
python app.py
```

The application will be available at http://127.0.0.1:5000

## How It Works

1. When Supabase credentials are configured, the chatbot fetches responses from the `chatbot_knowledge` table
2. If Supabase is not configured or unavailable, it falls back to the static knowledge base
3. All chat interactions are logged to the `chatbot_logs` table for analytics
4. The frontend remains unchanged and works with both dynamic and static data sources

## API Endpoints

- `GET /` - Serve the chatbot interface
- `POST /chat` - Process chat messages and return responses

## Customization

- Modify the knowledge base data in Supabase dashboard
- Update the UI in `templates/index.html` and `static/` files
- Extend functionality in `app.py`