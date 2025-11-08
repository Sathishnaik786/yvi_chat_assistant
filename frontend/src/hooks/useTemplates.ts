import { useState, useEffect } from 'react';
import type { AISettings } from './useSettings';

export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'coding' | 'writing' | 'analysis' | 'creative' | 'custom';
  systemPrompt: string;
  starterPrompts: string[];
  settings: AISettings;
  isDefault: boolean;
}

const DEFAULT_TEMPLATES: ConversationTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Get detailed code reviews with best practices',
    icon: '🔍',
    category: 'coding',
    systemPrompt: 'You are an expert code reviewer. Provide thorough, constructive feedback on code quality, security, performance, and best practices. Point out potential bugs and suggest improvements.',
    starterPrompts: [
      'Review this code for security issues',
      'How can I improve the performance of this function?',
      'Check this code for best practices',
    ],
    settings: {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 2048,
    },
    isDefault: true,
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'Generate creative ideas and solutions',
    icon: '💡',
    category: 'creative',
    systemPrompt: 'You are a creative thinking partner. Help generate innovative ideas, explore possibilities, and think outside the box. Be encouraging and build upon ideas.',
    starterPrompts: [
      'Help me brainstorm ideas for...',
      'What are some creative solutions for...',
      'Generate unique concepts for...',
    ],
    settings: {
      model: 'gpt-4o-mini',
      temperature: 0.9,
      maxTokens: 2048,
    },
    isDefault: true,
  },
  {
    id: 'writing-assistant',
    name: 'Writing Assistant',
    description: 'Improve your writing with professional feedback',
    icon: '✍️',
    category: 'writing',
    systemPrompt: 'You are a professional writing assistant. Help improve clarity, grammar, style, and structure. Provide constructive feedback and suggest better phrasing.',
    starterPrompts: [
      'Improve this paragraph',
      'Make this more professional',
      'Check this for grammar and style',
    ],
    settings: {
      model: 'gpt-4o-mini',
      temperature: 0.5,
      maxTokens: 2048,
    },
    isDefault: true,
  },
  {
    id: 'technical-analysis',
    name: 'Technical Analysis',
    description: 'Deep dive into technical topics',
    icon: '🔬',
    category: 'analysis',
    systemPrompt: 'You are a technical analyst. Provide in-depth, accurate analysis of technical topics. Break down complex concepts and explain thoroughly.',
    starterPrompts: [
      'Explain the technical details of...',
      'Analyze the architecture of...',
      'Compare these technologies...',
    ],
    settings: {
      model: 'gpt-4o',
      temperature: 0.4,
      maxTokens: 4096,
    },
    isDefault: true,
  },
  {
    id: 'general-chat',
    name: 'General Chat',
    description: 'Casual conversation and general questions',
    icon: '💬',
    category: 'custom',
    systemPrompt: 'You are a helpful, friendly assistant. Answer questions clearly and concisely. Be conversational and approachable.',
    starterPrompts: [
      'Tell me about...',
      'How does... work?',
      'What is...?',
    ],
    settings: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2048,
    },
    isDefault: true,
  },
];

const TEMPLATES_KEY = 'yvi_templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<ConversationTemplate[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (stored) {
      try {
        const custom = JSON.parse(stored);
        setTemplates([...DEFAULT_TEMPLATES, ...custom]);
      } catch (e) {
        console.error('Failed to parse templates:', e);
      }
    }
  }, []);

  const saveCustomTemplates = (customTemplates: ConversationTemplate[]) => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
  };

  const addTemplate = (template: Omit<ConversationTemplate, 'id' | 'isDefault'>) => {
    const newTemplate: ConversationTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      isDefault: false,
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveCustomTemplates(updated.filter(t => !t.isDefault));
  };

  const updateTemplate = (id: string, updates: Partial<ConversationTemplate>) => {
    const updated = templates.map(t => t.id === id ? { ...t, ...updates } : t);
    setTemplates(updated);
    saveCustomTemplates(updated.filter(t => !t.isDefault));
  };

  const deleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template?.isDefault) return; // Can't delete default templates
    
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveCustomTemplates(updated.filter(t => !t.isDefault));
  };

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
