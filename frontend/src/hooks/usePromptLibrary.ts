import { useState, useEffect } from 'react';

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  variables: string[]; // e.g., ['name', 'topic', 'language']
  isFavorite: boolean;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

const PROMPTS_KEY = 'yvi_prompt_library';

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'code-review-1',
    title: 'Code Review Request',
    content: 'Please review this {{language}} code for:\n- Best practices\n- Security vulnerabilities\n- Performance issues\n- Code quality\n\n```{{language}}\n{{code}}\n```',
    description: 'Comprehensive code review template',
    category: 'Development',
    tags: ['code', 'review', 'quality'],
    variables: ['language', 'code'],
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'explain-concept',
    title: 'Explain Concept',
    content: 'Explain {{concept}} in simple terms as if I\'m a {{level}}. Include:\n1. A clear definition\n2. Real-world examples\n3. Common use cases\n4. Key benefits and limitations',
    description: 'Get clear explanations of complex topics',
    category: 'Learning',
    tags: ['explain', 'education', 'learning'],
    variables: ['concept', 'level'],
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'writing-improve',
    title: 'Improve Writing',
    content: 'Please improve this {{type}} by:\n- Enhancing clarity and readability\n- Fixing grammar and style issues\n- Making it more {{tone}}\n- Keeping the core message intact\n\n{{text}}',
    description: 'Enhance any type of written content',
    category: 'Writing',
    tags: ['writing', 'editing', 'improvement'],
    variables: ['type', 'tone', 'text'],
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'brainstorm-ideas',
    title: 'Brainstorm Ideas',
    content: 'Help me brainstorm {{number}} creative ideas for {{topic}}. For each idea, provide:\n- A catchy title\n- Brief description\n- Why it could work\n- Potential challenges\n\nTarget audience: {{audience}}',
    description: 'Generate creative ideas with details',
    category: 'Creative',
    tags: ['brainstorm', 'ideas', 'creative'],
    variables: ['number', 'topic', 'audience'],
    isFavorite: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const usePromptLibrary = () => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(DEFAULT_PROMPTS);

  useEffect(() => {
    const stored = localStorage.getItem(PROMPTS_KEY);
    if (stored) {
      try {
        const custom = JSON.parse(stored);
        setPrompts([...DEFAULT_PROMPTS, ...custom]);
      } catch (e) {
        console.error('Failed to parse prompts:', e);
      }
    }
  }, []);

  const saveCustomPrompts = (customPrompts: PromptTemplate[]) => {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(customPrompts));
  };

  const addPrompt = (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    const newPrompt: PromptTemplate = {
      ...prompt,
      id: `custom-${Date.now()}`,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...prompts, newPrompt];
    setPrompts(updated);
    const customOnly = updated.filter(p => p.id.startsWith('custom-'));
    saveCustomPrompts(customOnly);
    return newPrompt.id;
  };

  const updatePrompt = (id: string, updates: Partial<PromptTemplate>) => {
    const updated = prompts.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    setPrompts(updated);
    const customOnly = updated.filter(p => p.id.startsWith('custom-'));
    saveCustomPrompts(customOnly);
  };

  const deletePrompt = (id: string) => {
    if (!id.startsWith('custom-')) return; // Can't delete defaults
    const updated = prompts.filter(p => p.id !== id);
    setPrompts(updated);
    const customOnly = updated.filter(p => p.id.startsWith('custom-'));
    saveCustomPrompts(customOnly);
  };

  const incrementUsage = (id: string) => {
    updatePrompt(id, { 
      usageCount: (prompts.find(p => p.id === id)?.usageCount || 0) + 1 
    });
  };

  const toggleFavorite = (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      updatePrompt(id, { isFavorite: !prompt.isFavorite });
    }
  };

  const getCategories = () => {
    const categories = new Set(prompts.map(p => p.category));
    return Array.from(categories);
  };

  const getAllTags = () => {
    const tags = new Set(prompts.flatMap(p => p.tags));
    return Array.from(tags);
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim());
  };

  return {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementUsage,
    toggleFavorite,
    getCategories,
    getAllTags,
    extractVariables,
  };
};
