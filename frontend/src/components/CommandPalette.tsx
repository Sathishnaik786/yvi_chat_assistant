import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  BarChart3,
  Star,
  FileCode,
  BookOpen,
  FileText,
  Share2,
  Folder,
  Home,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatSession } from '@/hooks/useChat';
import type { PromptTemplate } from '@/hooks/usePromptLibrary';
import Fuse from 'fuse.js';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: ChatSession[];
  prompts: PromptTemplate[];
  onAction: (action: string, data?: any) => void;
}

export const CommandPalette = ({
  open,
  onOpenChange,
  sessions,
  prompts,
  onAction,
}: CommandPaletteProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  // Fuzzy search setup
  const sessionsFuse = new Fuse(sessions, {
    keys: ['title', 'messages.content'],
    threshold: 0.4,
  });

  const promptsFuse = new Fuse(prompts, {
    keys: ['title', 'description', 'content'],
    threshold: 0.4,
  });

  const filteredSessions = search
    ? sessionsFuse.search(search).map(result => result.item)
    : sessions.slice(0, 5);

  const filteredPrompts = search
    ? promptsFuse.search(search).map(result => result.item)
    : prompts.slice(0, 5);

  const actions = [
    { id: 'new-chat', label: t('commands.newChat', 'New Chat'), icon: Plus, action: () => onAction('newChat') },
    { id: 'search', label: t('commands.search', 'Search Conversations'), icon: Search, action: () => onAction('search') },
    { id: 'settings', label: t('commands.settings', 'Open Settings'), icon: Settings, action: () => onAction('settings') },
    { id: 'analytics', label: t('commands.analytics', 'View Analytics'), icon: BarChart3, action: () => onAction('analytics') },
    { id: 'favorites', label: t('commands.favorites', 'View Favorites'), icon: Star, action: () => onAction('favorites') },
    { id: 'templates', label: t('commands.templates', 'Conversation Templates'), icon: FileCode, action: () => onAction('templates') },
    { id: 'prompts', label: t('commands.prompts', 'Prompt Library'), icon: BookOpen, action: () => onAction('prompts') },
    { id: 'folders', label: t('commands.folders', 'Manage Folders'), icon: Folder, action: () => onAction('folders') },
  ];

  const navigation = [
    { id: 'home', label: t('nav.home', 'Home'), icon: Home, path: '/' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t('commands.placeholder', 'Type a command or search...')}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{t('commands.noResults', 'No results found.')}</CommandEmpty>

        <CommandGroup heading={t('commands.quickActions', 'Quick Actions')}>
          {actions.map((action) => (
            <CommandItem
              key={action.id}
              onSelect={() => {
                action.action();
                onOpenChange(false);
              }}
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {filteredPrompts.length > 0 && (
          <>
            <CommandGroup heading={t('commands.prompts', 'Prompts')}>
              {filteredPrompts.map((prompt) => (
                <CommandItem
                  key={prompt.id}
                  onSelect={() => {
                    onAction('selectPrompt', prompt);
                    onOpenChange(false);
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{prompt.title}</span>
                  {prompt.isFavorite && <Star className="ml-auto h-4 w-4 fill-yellow-500 text-yellow-500" />}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {filteredSessions.length > 0 && (
          <CommandGroup heading={t('commands.chats', 'Recent Chats')}>
            {filteredSessions.map((session) => (
              <CommandItem
                key={session.id}
                onSelect={() => {
                  onAction('selectSession', session.id);
                  onOpenChange(false);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>{session.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading={t('commands.navigation', 'Navigation')}>
          {navigation.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => {
                navigate(item.path);
                onOpenChange(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
