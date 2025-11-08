import { useState, useEffect } from 'react';

export interface Favorite {
  id: string;
  messageId: string;
  sessionId: string;
  sessionTitle: string;
  messageContent: string;
  messageRole: 'user' | 'assistant';
  tags: string[];
  category: string;
  note?: string;
  timestamp: number;
}

const FAVORITES_KEY = 'yvi_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavorite = (favorite: Omit<Favorite, 'id' | 'timestamp'>) => {
    const newFavorite: Favorite = {
      ...favorite,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setFavorites(prev => [newFavorite, ...prev]);
    return newFavorite.id;
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const updateFavorite = (id: string, updates: Partial<Favorite>) => {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const isFavorite = (messageId: string) => {
    return favorites.some(f => f.messageId === messageId);
  };

  const getFavoriteByMessageId = (messageId: string) => {
    return favorites.find(f => f.messageId === messageId);
  };

  const getAllCategories = () => {
    const categories = new Set(favorites.map(f => f.category).filter(Boolean));
    return Array.from(categories);
  };

  const getAllTags = () => {
    const tags = new Set(favorites.flatMap(f => f.tags));
    return Array.from(tags);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    updateFavorite,
    isFavorite,
    getFavoriteByMessageId,
    getAllCategories,
    getAllTags,
  };
};
