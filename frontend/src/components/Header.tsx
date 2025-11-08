import { Moon, Sun, Menu, Settings, Search, BarChart3, Star, FileCode, BookOpen, FileText, Share2, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { ExportMenu } from './ExportMenu';
import { LanguageSelector } from './LanguageSelector';
import type { ChatSession } from '@/hooks/useChat';

interface HeaderProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onSearchClick: () => void;
  onAnalyticsClick: () => void;
  onFavoritesClick: () => void;
  onTemplatesClick: () => void;
  onPromptLibraryClick: () => void;
  onSummaryClick: () => void;
  onShareClick: () => void;
  onCommandPaletteClick: () => void;
  currentSession: ChatSession | undefined;
  allSessions: ChatSession[];
}

export const Header = ({ 
  onMenuClick, 
  onSettingsClick, 
  onSearchClick, 
  onAnalyticsClick,
  onFavoritesClick,
  onTemplatesClick,
  onPromptLibraryClick,
  onSummaryClick,
  onShareClick,
  onCommandPaletteClick,
  currentSession,
  allSessions,
}: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">YVI Tech Assistant</h1>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCommandPaletteClick}
            title="Command Palette (Ctrl+P)"
            className="shrink-0"
          >
            <Command className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPromptLibraryClick}
            title="Prompt library"
            className="shrink-0"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onTemplatesClick}
            title="Conversation templates"
            className="shrink-0"
          >
            <FileCode className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavoritesClick}
            title="Favorites"
            className="shrink-0"
          >
            <Star className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSummaryClick}
            title="Summarize conversation"
            className="shrink-0"
            disabled={!currentSession || currentSession.messages.length === 0}
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShareClick}
            title="Share conversation"
            className="shrink-0"
            disabled={!currentSession || currentSession.messages.length === 0}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            title="Search conversations"
            className="shrink-0"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAnalyticsClick}
            title="View analytics"
            className="shrink-0"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
          <ExportMenu currentSession={currentSession} allSessions={allSessions} />
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
