import { useMemo } from 'react';
import type { ChatSession } from './useChat';

export interface AnalyticsData {
  totalMessages: number;
  totalSessions: number;
  averageMessagesPerSession: number;
  totalUserMessages: number;
  totalAssistantMessages: number;
  averageResponseTime: number;
  messagesOverTime: Array<{ date: string; count: number }>;
  topicDistribution: Array<{ topic: string; count: number }>;
  dailyActivity: Array<{ day: string; messages: number }>;
}

export const useAnalytics = (sessions: ChatSession[]): AnalyticsData => {
  return useMemo(() => {
    let totalMessages = 0;
    let totalUserMessages = 0;
    let totalAssistantMessages = 0;
    let totalResponseTimes = 0;
    let responseCount = 0;
    
    const messagesByDate: Record<string, number> = {};
    const topicKeywords: Record<string, number> = {};
    const dailyMessages: Record<string, number> = {};

    sessions.forEach((session) => {
      totalMessages += session.messages.length;
      
      session.messages.forEach((message, index) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        messagesByDate[date] = (messagesByDate[date] || 0) + 1;
        
        const dayName = new Date(message.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        dailyMessages[dayName] = (dailyMessages[dayName] || 0) + 1;

        if (message.role === 'user') {
          totalUserMessages++;
          
          // Extract topics from user messages
          const words = message.content.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 4 && !['about', 'would', 'could', 'should', 'please', 'thank'].includes(word)) {
              topicKeywords[word] = (topicKeywords[word] || 0) + 1;
            }
          });
        } else {
          totalAssistantMessages++;
          
          // Calculate response time
          if (index > 0 && session.messages[index - 1].role === 'user') {
            const responseTime = message.timestamp - session.messages[index - 1].timestamp;
            totalResponseTimes += responseTime;
            responseCount++;
          }
        }
      });
    });

    const messagesOverTime = Object.entries(messagesByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7)
      .map(([date, count]) => ({ date, count }));

    const topicDistribution = Object.entries(topicKeywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyActivity = dayOrder.map(day => ({
      day,
      messages: dailyMessages[day] || 0,
    }));

    return {
      totalMessages,
      totalSessions: sessions.length,
      averageMessagesPerSession: sessions.length > 0 ? totalMessages / sessions.length : 0,
      totalUserMessages,
      totalAssistantMessages,
      averageResponseTime: responseCount > 0 ? totalResponseTimes / responseCount : 0,
      messagesOverTime,
      topicDistribution,
      dailyActivity,
    };
  }, [sessions]);
};
