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
  BarChart3,
  Moon,
  Sun,
  MoreVertical,
  Trash2,
  FileArchive,
  Pencil,
  Flag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/hooks/useChat';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ModernSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  currentSession?: ChatSession; // Add this new prop
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession?: (id: string, updates: Partial<ChatSession>) => void; // Add this new prop
  isOpen: boolean;
  onToggle: () => void;
  onAuthClick: () => void;
  onSettingsClick: () => void;
  // Additional props for mobile settings menu
  onAnalyticsClick: () => void;
  onFavoritesClick: () => void;
  onTemplatesClick: () => void;
  onPromptLibraryClick: () => void;
  onSummaryClick: () => void;
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
  onUpdateSession,
  isOpen,
  onToggle,
  onAuthClick,
  onSettingsClick,
  onAnalyticsClick,
  onFavoritesClick,
  onTemplatesClick,
  onPromptLibraryClick,
  onSummaryClick,
  onCommandPaletteClick,
  onThemeToggle,
  isDarkMode,
}: ModernSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) && !session.archived
  );

  const archivedSessions = sessions.filter(session => session.archived);

  // Function to handle renaming a chat
  const handleRenameChat = (sessionId: string, currentTitle: string) => {
    const newTitle = prompt('Enter new chat title:', currentTitle);
    if (newTitle !== null && newTitle.trim() !== '' && newTitle !== currentTitle) {
      if (onUpdateSession) {
        onUpdateSession(sessionId, { title: newTitle.trim() });
      } else {
        // Fallback to localStorage if onUpdateSession is not provided
        const updatedSessions = sessions.map(s => 
          s.id === sessionId ? { ...s, title: newTitle.trim(), lastUpdated: Date.now() } : s
        );
        localStorage.setItem('yvi_chat_sessions', JSON.stringify(updatedSessions));
        // Update state instead of reloading the page
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  // Function to handle archiving a chat
  const handleArchiveChat = (sessionId: string) => {
    if (window.confirm('Are you sure you want to archive this chat?')) {
      if (onUpdateSession) {
        onUpdateSession(sessionId, { archived: true });
      } else {
        // Fallback to localStorage if onUpdateSession is not provided
        const updatedSessions = sessions.map(s => 
          s.id === sessionId ? { ...s, archived: true, lastUpdated: Date.now() } : s
        );
        localStorage.setItem('yvi_chat_sessions', JSON.stringify(updatedSessions));
        // Update state instead of reloading the page
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

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
          "flex flex-col overflow-y-auto smooth-scroll", // Add smooth-scroll for better mobile experience
          isOpen ? "w-4/5 md:w-64 lg:w-72" : "w-16",
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
                  <div key={session.id} className="flex items-center group">
                    <Button
                      variant="ghost"
                      onClick={() => onSelectSession(session.id)}
                      className={cn(
                        "flex-1 justify-start gap-2 text-left font-normal",
                        "text-sidebar-foreground hover:bg-sidebar-accent touch-target",
                        currentSessionId === session.id && "bg-sidebar-accent"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameChat(session.id, session.title);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveChat(session.id);
                          }}
                        >
                          <FileArchive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle report action
                            console.log('Report chat:', session.id);
                            // You can implement the actual report functionality here
                            alert('Chat reported. Thank you for helping us improve!');
                          }}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                              onDeleteSession(session.id);
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}

              {/* Archived Chats Section */}
              {archivedSessions.length > 0 && (
                <div className="mt-4">
                  <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                    Archived Chats
                  </div>
                  {archivedSessions.map((session) => (
                    <div key={session.id} className="flex items-center group">
                      <Button
                        variant="ghost"
                        onClick={() => onSelectSession(session.id)}
                        className={cn(
                          "flex-1 justify-start gap-2 text-left font-normal",
                          "text-sidebar-foreground hover:bg-sidebar-accent touch-target",
                          currentSessionId === session.id && "bg-sidebar-accent"
                        )}
                      >
                        <FileArchive className="h-4 w-4 shrink-0" />
                        <span className="truncate">{session.title}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameChat(session.id, session.title);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Unarchive the chat
                              if (onUpdateSession) {
                                onUpdateSession(session.id, { archived: false });
                              } else {
                                // Fallback to localStorage if onUpdateSession is not provided
                                const updatedSessions = sessions.map(s => 
                                  s.id === session.id ? { ...s, archived: false, lastUpdated: Date.now() } : s
                                );
                                localStorage.setItem('yvi_chat_sessions', JSON.stringify(updatedSessions));
                                // Update state instead of reloading the page
                                window.dispatchEvent(new Event('storage'));
                              }
                            }}
                          >
                            <FileArchive className="mr-2 h-4 w-4" />
                            Unarchive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle report action
                              console.log('Report archived chat:', session.id);
                              // You can implement the actual report functionality here
                              alert('Chat reported. Thank you for helping us improve!');
                            }}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                                onDeleteSession(session.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-1 py-2">
              {filteredSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center group">
                  <Tooltip>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(session.id, session.title);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveChat(session.id);
                        }}
                      >
                        <FileArchive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle report action
                          console.log('Report chat:', session.id);
                          // You can implement the actual report functionality here
                          alert('Chat reported. Thank you for helping us improve!');
                        }}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                            onDeleteSession(session.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent touch-target no-select"
                      onClick={() => {
                        onThemeToggle();
                        // Close sidebar after theme toggle on mobile
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
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
                      Ap Settings
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