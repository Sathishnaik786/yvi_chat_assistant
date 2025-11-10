import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  PanelLeftClose, 
  PanelLeft, 
  Plus, 
  Search, 
  Library, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  MessageSquare,
  Command,
  BookOpen,
  FileCode,
  Star,
  FileText,
  Share2,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/hooks/useChat';

interface ModernSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  currentSession?: ChatSession; // Add this new prop
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onAuthClick: () => void;
  onSettingsClick: () => void;
  // Additional props for mobile settings menu
  onSearchClick: () => void;
  onAnalyticsClick: () => void;
  onFavoritesClick: () => void;
  onTemplatesClick: () => void;
  onPromptLibraryClick: () => void;
  onSummaryClick: () => void;
  onShareClick: () => void;
  onCommandPaletteClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export const ModernSidebar = ({
  sessions,
  currentSessionId,
  currentSession, // Add this new prop
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onToggle,
  onAuthClick,
  onSettingsClick,
  onSearchClick,
  onAnalyticsClick,
  onFavoritesClick,
  onTemplatesClick,
  onPromptLibraryClick,
  onSummaryClick,
  onShareClick,
  onCommandPaletteClick,
  onThemeToggle,
  isDarkMode,
}: ModernSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border",
          "transition-all duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "w-64 md:w-72" : "w-16",
          "lg:relative lg:z-auto lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
          {isOpen ? (
            <>
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="YVI Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="font-semibold text-sidebar-foreground">YVI Tech</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <PanelLeftClose className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="text-sidebar-foreground hover:bg-sidebar-accent w-full"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Main Actions */}
        <div className="p-2 space-y-1">
          {isOpen ? (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
                />
              </div>
              
              <Button
                onClick={onNewChat}
                variant="ghost"
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
              >
                <Library className="h-4 w-4" />
                Library
              </Button>
            </>
          ) : (
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Search</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Library className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Library</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-2">
          {isOpen ? (
            <div className="space-y-1 py-2">
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-sidebar-foreground/50 text-center py-4">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </p>
              ) : (
                filteredSessions.map((session) => (
                  <Button
                    key={session.id}
                    variant="ghost"
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "w-full justify-start gap-2 text-left font-normal",
                      "text-sidebar-foreground hover:bg-sidebar-accent touch-target",
                      currentSessionId === session.id && "bg-sidebar-accent"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </Button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {filteredSessions.slice(0, 5).map((session) => (
                <Tooltip key={session.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectSession(session.id)}
                      className={cn(
                        "w-full text-sidebar-foreground hover:bg-sidebar-accent touch-target no-select",
                        currentSessionId === session.id && "bg-sidebar-accent"
                      )}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="max-w-xs truncate">{session.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          {isOpen ? (
            <div className="space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium text-sidebar-foreground">{user?.name || 'User'}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                    onClick={onSettingsClick}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {/* Mobile-only settings menu with all navbar icons */}
                  <div className="lg:hidden space-y-1">
                    <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                      Tools
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onCommandPaletteClick}
                    >
                      <Command className="h-4 w-4" />
                      Command Palette
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onPromptLibraryClick}
                    >
                      <BookOpen className="h-4 w-4" />
                      Prompt Library
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onTemplatesClick}
                    >
                      <FileCode className="h-4 w-4" />
                      Templates
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onFavoritesClick}
                    >
                      <Star className="h-4 w-4" />
                      Favorites
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onSummaryClick}
                    >
                      <FileText className="h-4 w-4" />
                      Summarize
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onShareClick}
                      disabled={!currentSession || currentSession.messages.length === 0}
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onSearchClick}
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onAnalyticsClick}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Button>
                    <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mt-2">
                      Settings
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onThemeToggle}
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-4 w-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target"
                      onClick={onSettingsClick}
                    >
                      <Settings className="h-4 w-4" />
                      App Settings
                    </Button>
                  </div>
                  <Button
                    onClick={onAuthClick}
                    className="w-full border border-sidebar-primary text-sidebar-primary bg-transparent hover:bg-sidebar-primary/10 rounded-xl touch-target"
                  >
                    Login / Sign Up
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={isAuthenticated ? onSettingsClick : onAuthClick}
                  className="w-full text-sidebar-foreground hover:bg-sidebar-accent touch-target no-select"
                >
                  <User className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isAuthenticated ? user?.email : 'Login'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
};