import os
import sys

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import log_chat_interaction

if __name__ == "__main__":
    print("Testing chat logging...")
    log_chat_interaction('test query', 'test response', 'test category', 'test source')
    print("Test completed")