import { useState, useEffect, useCallback, useMemo } from 'react';
import { sendMessage } from '@/utils/api';
import type { AISettings } from './useSettings';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  source?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
  folderId?: string | null;
  tags?: string[];
  archived?: boolean;
}

const STORAGE_KEY = 'yvi_chat_sessions';
const CURRENT_SESSION_KEY = 'yvi_current_session';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  // Memoize currentSession to prevent unnecessary re-renders
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  const generateSessionTitle = (firstMessage: string): string => {
    return firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
  };

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
    
    if (stored) {
      const parsedSessions = JSON.parse(stored);
      setSessions(parsedSessions);
      
      if (currentId && parsedSessions.some((s: ChatSession) => s.id === currentId)) {
        setCurrentSessionId(currentId);
      } else if (parsedSessions.length > 0) {
        setCurrentSessionId(parsedSessions[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, [createNewSession]);

  // Add event listener for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSessions = JSON.parse(stored);
        setSessions(parsedSessions);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (sessionId === currentSessionId && filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        createNewSession();
      }
      return filtered;
    });
  }, [currentSessionId, createNewSession]);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
    createNewSession();
  }, [createNewSession]);

  const updateSessionOrder = useCallback((sessionIds: string[]) => {
    setSessions(prev => {
      const sessionMap = new Map(prev.map(s => [s.id, s]));
      return sessionIds.map(id => sessionMap.get(id)).filter(Boolean) as ChatSession[];
    });
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, ...updates, lastUpdated: Date.now() } : session
    ));
  }, []);

  const bulkDeleteSessions = useCallback((sessionIds: string[]) => {
    setSessions(prev => {
      const filtered = prev.filter(s => !sessionIds.includes(s.id));
      if (sessionIds.includes(currentSessionId) && filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        createNewSession();
      }
      return filtered;
    });
  }, [currentSessionId, createNewSession]);

  const bulkUpdateSessions = useCallback((sessionIds: string[], updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session =>
      sessionIds.includes(session.id) ? { ...session, ...updates } : session
    ));
  }, []);

  const sendUserMessage = useCallback(async (content: string, settings?: AISettings) => {
    if (!content.trim() || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const updatedMessages = [...session.messages, userMessage];
        const title = session.messages.length === 0 
          ? generateSessionTitle(content)
          : session.title;
        
        return {
          ...session,
          messages: updatedMessages,
          title,
          lastUpdated: Date.now(),
        };
      }
      return session;
    }));

    setIsTyping(true);
    setError(null);

    try {
      const response = await sendMessage({
        message: content,
        sessionId: currentSessionId,
        settings: settings ? {
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        } : undefined,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        source: response.source,
      };

      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, assistantMessage],
            lastUpdated: Date.now(),
          };
        }
        return session;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId]);

  return {
    sessions,
    currentSession,
    isTyping,
    error,
    sendUserMessage,
    createNewSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    updateSessionOrder,
    updateSession,
    bulkDeleteSessions,
    bulkUpdateSessions,
  };
};
