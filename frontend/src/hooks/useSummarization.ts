import { useState } from 'react';
import type { ChatSession } from './useChat';

export interface ConversationSummary {
  sessionId: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  topics: string[];
  messageCount: number;
  generatedAt: number;
}

export const useSummarization = () => {
  const [summaries, setSummaries] = useState<Map<string, ConversationSummary>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async (session: ChatSession): Promise<ConversationSummary> => {
    setIsGenerating(true);

    try {
      // Build conversation text
      const conversationText = session.messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      // Simple local summarization (in production, you'd call an AI API)
      const summary = await generateLocalSummary(conversationText, session);
      
      setSummaries(prev => new Map(prev).set(session.id, summary));
      return summary;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocalSummary = async (
    text: string, 
    session: ChatSession
  ): Promise<ConversationSummary> => {
    // Extract key information from the conversation
    const messages = session.messages;
    
    // Extract topics by looking at user questions
    const userMessages = messages.filter(m => m.role === 'user');
    const topics = extractTopics(userMessages.map(m => m.content));

    // Extract action items (things that should be done)
    const actionItems = extractActionItems(messages.map(m => m.content));

    // Generate key points
    const keyPoints = extractKeyPoints(messages.map(m => m.content));

    // Generate a brief summary
    const summary = `This conversation covered ${topics.join(', ')}. ` +
      `The discussion included ${messages.length} messages and focused on ` +
      `${session.title.toLowerCase()}. Key insights and solutions were exchanged.`;

    return {
      sessionId: session.id,
      summary,
      keyPoints,
      actionItems,
      topics,
      messageCount: messages.length,
      generatedAt: Date.now(),
    };
  };

  const extractTopics = (texts: string[]): string[] => {
    const topicKeywords = new Map<string, number>();
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5 && !isCommonWord(word)) {
          topicKeywords.set(word, (topicKeywords.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(topicKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  const extractActionItems = (texts: string[]): string[] => {
    const actionItems: string[] = [];
    const actionWords = ['need to', 'should', 'must', 'have to', 'will', 'going to', 'todo', 'action'];

    texts.forEach(text => {
      const sentences = text.split(/[.!?]+/);
      sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        if (actionWords.some(word => lower.includes(word))) {
          const trimmed = sentence.trim();
          if (trimmed.length > 20 && trimmed.length < 150) {
            actionItems.push(trimmed);
          }
        }
      });
    });

    return actionItems.slice(0, 5);
  };

  const extractKeyPoints = (texts: string[]): string[] => {
    const keyPoints: string[] = [];
    
    texts.forEach(text => {
      const sentences = text.split(/[.!?]+/);
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        // Look for sentences that seem important (contain certain patterns)
        if (trimmed.length > 30 && trimmed.length < 200) {
          const lower = trimmed.toLowerCase();
          if (
            lower.includes('important') ||
            lower.includes('key') ||
            lower.includes('note that') ||
            lower.includes('remember') ||
            lower.includes('essentially') ||
            lower.includes('main')
          ) {
            keyPoints.push(trimmed);
          }
        }
      });
    });

    // If no explicit key points found, take some substantial sentences
    if (keyPoints.length === 0) {
      texts.forEach(text => {
        const sentences = text.split(/[.!?]+/);
        sentences.slice(0, 2).forEach(sentence => {
          const trimmed = sentence.trim();
          if (trimmed.length > 50 && trimmed.length < 200) {
            keyPoints.push(trimmed);
          }
        });
      });
    }

    return keyPoints.slice(0, 5);
  };

  const isCommonWord = (word: string): boolean => {
    const common = ['about', 'would', 'could', 'should', 'please', 'thank', 'thanks', 
                    'hello', 'there', 'where', 'which', 'their', 'these', 'those'];
    return common.includes(word);
  };

  const getSummary = (sessionId: string): ConversationSummary | undefined => {
    return summaries.get(sessionId);
  };

  return {
    generateSummary,
    getSummary,
    isGenerating,
  };
};
