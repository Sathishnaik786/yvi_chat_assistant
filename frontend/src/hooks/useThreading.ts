import { useState, useEffect } from 'react';

export interface MessageThread {
  id: string;
  parentMessageId: string;
  sessionId: string;
  branchName: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  createdAt: number;
}

const THREADS_KEY = 'yvi_message_threads';

export const useThreading = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(THREADS_KEY);
    if (stored) {
      try {
        setThreads(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse threads:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  const createThread = (
    parentMessageId: string,
    sessionId: string,
    branchName: string,
    initialMessages: MessageThread['messages']
  ) => {
    const newThread: MessageThread = {
      id: Date.now().toString(),
      parentMessageId,
      sessionId,
      branchName,
      messages: initialMessages,
      createdAt: Date.now(),
    };
    setThreads(prev => [newThread, ...prev]);
    return newThread.id;
  };

  const addMessageToThread = (
    threadId: string,
    message: MessageThread['messages'][0]
  ) => {
    setThreads(prev =>
      prev.map(thread =>
        thread.id === threadId
          ? { ...thread, messages: [...thread.messages, message] }
          : thread
      )
    );
  };

  const deleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
  };

  const getThreadsBySession = (sessionId: string) => {
    return threads.filter(t => t.sessionId === sessionId);
  };

  const getThreadsByParentMessage = (parentMessageId: string) => {
    return threads.filter(t => t.parentMessageId === parentMessageId);
  };

  const updateThread = (threadId: string, updates: Partial<MessageThread>) => {
    setThreads(prev =>
      prev.map(thread =>
        thread.id === threadId ? { ...thread, ...updates } : thread
      )
    );
  };

  return {
    threads,
    createThread,
    addMessageToThread,
    deleteThread,
    getThreadsBySession,
    getThreadsByParentMessage,
    updateThread,
  };
};
