import { useState, useEffect, useCallback } from 'react';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  isExpanded: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

const STORAGE_KEY = 'yvi_folders';
const TAGS_STORAGE_KEY = 'yvi_tags';

const defaultFolders: Folder[] = [
  {
    id: 'root',
    name: 'All Chats',
    parentId: null,
    isExpanded: true,
    createdAt: Date.now(),
  },
];

const defaultTags: Tag[] = [
  { id: 'work', name: 'Work', color: 'hsl(217, 91%, 60%)' },
  { id: 'personal', name: 'Personal', color: 'hsl(142, 71%, 45%)' },
  { id: 'important', name: 'Important', color: 'hsl(0, 84%, 60%)' },
  { id: 'research', name: 'Research', color: 'hsl(262, 83%, 58%)' },
];

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [tags, setTags] = useState<Tag[]>(defaultTags);

  // Load from localStorage
  useEffect(() => {
    const storedFolders = localStorage.getItem(STORAGE_KEY);
    const storedTags = localStorage.getItem(TAGS_STORAGE_KEY);

    if (storedFolders) {
      setFolders(JSON.parse(storedFolders));
    }
    if (storedTags) {
      setTags(JSON.parse(storedTags));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);

  const createFolder = useCallback((name: string, parentId: string | null = null, color?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      color,
      isExpanded: true,
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setFolders(prev =>
      prev.map(folder => (folder.id === id ? { ...folder, ...updates } : folder))
    );
  }, []);

  const deleteFolder = useCallback((id: string) => {
    if (id === 'root') return; // Can't delete root
    setFolders(prev => prev.filter(folder => folder.id !== id && folder.parentId !== id));
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setFolders(prev =>
      prev.map(folder =>
        folder.id === id ? { ...folder, isExpanded: !folder.isExpanded } : folder
      )
    );
  }, []);

  const createTag = useCallback((name: string, color: string) => {
    const newTag: Tag = {
      id: Date.now().toString(),
      name,
      color,
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  }, []);

  const getSubfolders = useCallback((parentId: string | null) => {
    return folders.filter(folder => folder.parentId === parentId);
  }, [folders]);

  return {
    folders,
    tags,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleFolder,
    createTag,
    deleteTag,
    getSubfolders,
  };
};
