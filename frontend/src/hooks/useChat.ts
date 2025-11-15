import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sendMessage } from '@/utils/api';
import { revealByChar } from '@/utils/typist';
import type { AISettings } from './useSettings';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  source?: string;
  // Added for typewriter effect
  displayedContent?: string;
  isRevealed?: boolean;
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

// Configuration constants
const REVEAL_MODE = 'char'; // 'char' or 'word'
const CHAR_SPEED_MS = 25;
const WORD_SPEED_MS = 180;

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for abort controllers to manage reveal cancellation
  const abortControllerRefs = useRef<Map<string, AbortController>>(new Map());

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
    // Reset typing state when switching sessions
    setIsTyping(false);
  }, []);
  
  // Reset typing state when current session changes
  useEffect(() => {
    setIsTyping(false);
  }, [currentSessionId]);

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

  // Function to skip reveal for a specific message
  const skipReveal = useCallback((messageId: string) => {
    const controller = abortControllerRefs.current.get(messageId);
    if (controller) {
      controller.abort();
      abortControllerRefs.current.delete(messageId);
    }
    
    // Update message to show full content
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: session.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, displayedContent: msg.content, isRevealed: true } 
              : msg
          ),
          lastUpdated: Date.now(),
        };
      }
      return session;
    }));
  }, [currentSessionId]);

  // Function to automatically skip reveal when user sends a new message
  const autoSkipReveal = useCallback(() => {
    setSessions(prev => {
      const currentSession = prev.find(s => s.id === currentSessionId);
      if (!currentSession) return prev;
      
      // Find any assistant message that is currently being revealed
      const unrevealedMessage = currentSession.messages
        .filter(msg => msg.role === 'assistant')
        .find(msg => !msg.isRevealed && msg.displayedContent !== msg.content);
      
      if (unrevealedMessage) {
        skipReveal(unrevealedMessage.id);
      }
      
      return prev;
    });
  }, [currentSessionId, skipReveal]);

  const sendUserMessage = useCallback(async (content: string, settings?: AISettings) => {
    if (!content.trim() || !currentSessionId) return;

    // Auto-skip any ongoing reveal when user sends a new message
    autoSkipReveal();

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
        displayedContent: '', // Initialize with empty string for progressive reveal
        isRevealed: false, // Mark as not fully revealed yet
      };

      // Add the assistant message immediately
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

      // Start the reveal process
      const controller = new AbortController();
      abortControllerRefs.current.set(assistantMessage.id, controller);
      
      // Update message with revealed content progressively
      await revealByChar(
        response.reply,
        (current) => {
          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: session.messages.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, displayedContent: current } 
                    : msg
                ),
                lastUpdated: Date.now(),
              };
            }
            return session;
          }));
        },
        CHAR_SPEED_MS,
        controller.signal
      );

      // Mark message as fully revealed
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: session.messages.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, isRevealed: true } 
                : msg
            ),
            lastUpdated: Date.now(),
          };
        }
        return session;
      }));

      // Clean up abort controller
      abortControllerRefs.current.delete(assistantMessage.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setIsTyping(false);
    }
  }, [currentSessionId, autoSkipReveal]);

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
    skipReveal, // Export the skipReveal function
  };
};