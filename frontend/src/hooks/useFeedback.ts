import { useState, useEffect } from 'react';

export interface MessageFeedback {
  messageId: string;
  rating: 'positive' | 'negative';
  comment: string;
  timestamp: number;
}

const FEEDBACK_KEY = 'yvi_message_feedback';

export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<MessageFeedback[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    if (stored) {
      try {
        setFeedbacks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse feedback:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (feedbacks.length > 0) {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
    }
  }, [feedbacks]);

  const addFeedback = (messageId: string, rating: 'positive' | 'negative', comment: string, remove?: boolean) => {
    if (remove) {
      // Remove feedback for this message
      setFeedbacks(prev => prev.filter(f => f.messageId !== messageId));
    } else {
      // Add or update feedback
      const newFeedback: MessageFeedback = {
        messageId,
        rating,
        comment,
        timestamp: Date.now(),
      };

      setFeedbacks(prev => {
        const filtered = prev.filter(f => f.messageId !== messageId);
        return [...filtered, newFeedback];
      });
    }
  };

  const getFeedback = (messageId: string) => {
    return feedbacks.find(f => f.messageId === messageId);
  };

  return {
    addFeedback,
    getFeedback,
  };
};