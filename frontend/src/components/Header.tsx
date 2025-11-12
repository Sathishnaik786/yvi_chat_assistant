import { Moon, Sun, Menu, Settings, BarChart3, Star, FileCode, BookOpen, FileText, Command, Pen, MoreVertical, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { ExportMenu } from './ExportMenu';
import { LanguageSelector } from './LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { ChatSession } from '@/hooks/useChat';

interface HeaderProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onAnalyticsClick: () => void;
  onFavoritesClick: () => void;
  onTemplatesClick: () => void;
  onPromptLibraryClick: () => void;
  onSummaryClick: () => void;
  onCommandPaletteClick: () => void;
  onNewChat: () => void; // Add this new prop
  onDeleteChat: () => void; // Add delete chat prop
  currentSession: ChatSession | undefined;
  allSessions: ChatSession[];
}

export const Header = ({ 
  onMenuClick, 
  onSettingsClick, 
  onAnalyticsClick,
  onFavoritesClick,
  onTemplatesClick,
  onPromptLibraryClick,
  onSummaryClick,
  onCommandPaletteClick,
  onNewChat, // Add this new prop
  onDeleteChat, // Add delete chat prop
  currentSession,
  allSessions,
}: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-background sticky top-0 z-50 lg:z-10 lg:static">
      <div className="flex items-center justify-between px-2 md:px-4 h-14">
        {/* Mobile: Menu button on left */}
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="touch-target"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Mobile: Centered title with curved box */}
        <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
          <div className="bg-background border border-border rounded-xl px-4 py-2 shadow-sm">
            <h1 className="text-base font-semibold">YVI Assistant</h1>
          </div>
        </div>
        
        {/* Mobile: Pen icon and 3-dot menu on right */}
        <div className="flex items-center gap-2 lg:hidden absolute right-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="touch-target hover:bg-sidebar-accent"
            title="New chat"
          >
            <Pen className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target hover:bg-sidebar-accent"
                title="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileCode className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={onDeleteChat}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Desktop: Menu button and title on left */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="touch-target"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold truncate max-w-[120px] md:max-w-xs">YVI Assistant</h1>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCommandPaletteClick}
              title="Command Palette (Ctrl+P)"
              className="shrink-0 touch-target"
            >
              <Command className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPromptLibraryClick}
              title="Prompt library"
              className="shrink-0 touch-target"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onTemplatesClick}
              title="Conversation templates"
              className="shrink-0 touch-target"
            >
              <FileCode className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onFavoritesClick}
              title="Favorites"
              className="shrink-0 touch-target"
            >
              <Star className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSummaryClick}
              title="Summarize conversation"
              className="shrink-0 touch-target"
              disabled={!currentSession || currentSession.messages.length === 0}
            >
              <FileText className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAnalyticsClick}
              title="View analytics"
              className="shrink-0 touch-target"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <ExportMenu currentSession={currentSession} allSessions={allSessions} />
          </div>
          <div className="hidden lg:flex">
            <LanguageSelector />
          </div>
          <div className="hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                // Close any open menus on mobile after theme toggle
                if (window.innerWidth < 1024) {
                  const dropdowns = document.querySelectorAll('.dropdown-content');
                  dropdowns.forEach(d => d.classList.add('hidden'));
                }
              }}
              className="touch-target"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button variant="ghost" size="icon" onClick={onSettingsClick} className="touch-target">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};