import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-backend-domain.com';

export interface ChatRequest {
  message: string;
  sessionId?: string;
  settings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatResponse {
  reply: string;
}

export const sendMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      throw new Error(error.response.data?.error || 'Failed to send message');
    }
    throw error;
  }
};
