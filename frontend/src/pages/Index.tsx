import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { Header } from '@/components/Header';
import { ModernSidebar } from '@/components/ModernSidebar';
import { AuthModal } from '@/components/AuthModal';
import { CommandPalette } from '@/components/CommandPalette';
import { ChatWindow } from '@/components/ChatWindow';
import { InputBar } from '@/components/InputBar';
import { SettingsModal } from '@/components/SettingsModal';
import { SearchModal } from '@/components/SearchModal';
import { AnalyticsModal } from '@/components/AnalyticsModal';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { FavoritesModal } from '@/components/FavoritesModal';
import { TemplatesModal } from '@/components/TemplatesModal';
import { PromptLibraryModal } from '@/components/PromptLibraryModal';
import { PromptVariablesDialog } from '@/components/PromptVariablesDialog';
import { SummaryModal } from '@/components/SummaryModal';
import { ShareModal } from '@/components/ShareModal';
import { useChat } from '@/hooks/useChat';
import { useSettings } from '@/hooks/useSettings';
import { useFeedback } from '@/hooks/useFeedback';
import { useFavorites } from '@/hooks/useFavorites';
import { useTemplates } from '@/hooks/useTemplates';
import { useThreading } from '@/hooks/useThreading';
import { usePromptLibrary, type PromptTemplate } from '@/hooks/usePromptLibrary';
import { useSummarization } from '@/hooks/useSummarization';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFolders } from '@/hooks/useFolders';
import { useLanguage } from '@/hooks/useLanguage';
import { shareConversation } from '@/utils/sharing';
import { ThemeProvider } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import type { ConversationTemplate } from '@/hooks/useTemplates';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [promptVariablesOpen, setPromptVariablesOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const {
    sessions,
    currentSession,
    isTyping,
    error,
    sendUserMessage,
    createNewSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    updateSessionOrder,
    bulkDeleteSessions,
    bulkUpdateSessions,
  } = useChat();

  const { settings, updateSettings, resetSettings } = useSettings();
  const { addFeedback, getFeedback } = useFeedback();
  const { 
    favorites, 
    addFavorite, 
    removeFavorite, 
    isFavorite, 
    getFavoriteByMessageId,
    getAllCategories,
    getAllTags,
  } = useFavorites();
  const { templates } = useTemplates();
  const { 
    getThreadsByParentMessage, 
    createThread, 
  } = useThreading();
  const { 
    prompts, 
    incrementUsage, 
    toggleFavorite: togglePromptFavorite,
    getCategories: getPromptCategories,
  } = usePromptLibrary();
  const { 
    generateSummary, 
    getSummary, 
    isGenerating 
  } = useSummarization();
  const {
    folders,
    tags,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleFolder,
    createTag,
    deleteTag,
    getSubfolders,
  } = useFolders();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      description: 'Open search',
      action: () => setSearchOpen(true),
    },
    {
      key: 'n',
      ctrl: true,
      description: 'New chat',
      action: () => {
        createNewSession();
        toast({ title: 'New chat created' });
      },
    },
    {
      key: ',',
      ctrl: true,
      description: 'Open settings',
      action: () => setSettingsOpen(true),
    },
    {
      key: 'a',
      ctrl: true,
      shift: true,
      description: 'View analytics',
      action: () => setAnalyticsOpen(true),
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Delete current chat',
      action: () => {
        if (currentSession) {
          deleteSession(currentSession.id);
          toast({ title: 'Chat deleted' });
        }
      },
    },
    {
      key: '/',
      ctrl: true,
      description: 'Show keyboard shortcuts',
      action: () => setShortcutsOpen(true),
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Open command palette',
      action: () => setCommandPaletteOpen(true),
    },
  ]);

  const handleSendMessage = (content: string) => {
    sendUserMessage(content, settings);
  };

  const handleToggleFavorite = (messageId: string, category: string, tags: string[], note: string) => {
    const message = currentSession?.messages.find(m => m.id === messageId);
    if (message && currentSession) {
      addFavorite({
        messageId,
        sessionId: currentSession.id,
        sessionTitle: currentSession.title,
        messageContent: message.content,
        messageRole: message.role,
        category,
        tags,
        note,
      });
    }
  };

  const handleCreateThread = (messageId: string, branchName: string) => {
    if (!currentSession) return;
    
    const messageIndex = currentSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const messagesUpToPoint = currentSession.messages.slice(0, messageIndex + 1);
    createThread(messageId, currentSession.id, branchName, messagesUpToPoint);
  };

  const handleSelectTemplate = (template: ConversationTemplate) => {
    updateSettings({ ...settings, ...template.settings });
  };

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    incrementUsage(prompt.id);
    
    if (prompt.variables.length > 0) {
      setSelectedPrompt(prompt);
      setPromptVariablesOpen(true);
    } else {
      handleSendMessage(prompt.content);
      toast({ title: 'Prompt inserted' });
    }
  };

  const handlePromptWithVariables = (filledPrompt: string) => {
    handleSendMessage(filledPrompt);
    toast({ title: 'Prompt sent' });
  };

  const handleGenerateSummary = async () => {
    if (!currentSession) return;
    
    try {
      await generateSummary(currentSession);
      toast({ title: 'Summary generated!' });
    } catch (error) {
      toast({ 
        title: 'Failed to generate summary',
        variant: 'destructive' 
      });
    }
  };

  const handleShare = () => {
    if (!currentSession) return;
    
    const code = shareConversation(currentSession);
    setShareCode(code);
    setShareOpen(true);
  };

  const getThreadCount = (messageId: string) => {
    return getThreadsByParentMessage(messageId).length;
  };

  const handleFavoriteNavigate = (sessionId: string, messageId: string) => {
    switchSession(sessionId);
    setFavoritesOpen(false);
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          messageElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }, 100);
  };

  const handleSearchResultClick = (sessionId: string, messageId: string) => {
    switchSession(sessionId);
    // Scroll to message after switching sessions
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          messageElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
      }
    }, 100);
  };

  const handleCommandPaletteAction = (action: string, data?: ConversationTemplate | string) => {
    switch (action) {
      case 'newChat':
        createNewSession();
        break;
      case 'search':
        setSearchOpen(true);
        break;
      case 'settings':
        setSettingsOpen(true);
        break;
      case 'analytics':
        setAnalyticsOpen(true);
        break;
      case 'favorites':
        setFavoritesOpen(true);
        break;
      case 'templates':
        setTemplatesOpen(true);
        break;
      case 'prompts':
        setPromptLibraryOpen(true);
        break;
      case 'folders':
        // Open folder management in sidebar
        setSidebarOpen(true);
        break;
      case 'selectPrompt':
        // Skip this case for now to avoid type issues
        break;
      case 'selectSession':
        switchSession(data as string);
        break;
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="flex h-screen w-full overflow-hidden">
          <ModernSidebar
            sessions={sessions}
            currentSessionId={currentSession?.id || ''}
            currentSession={currentSession}
            onNewChat={createNewSession}
            onSelectSession={switchSession}
            onDeleteSession={deleteSession}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onAuthClick={() => setAuthModalOpen(true)}
            onSettingsClick={() => setSettingsOpen(true)}
            onSearchClick={() => setSearchOpen(true)}
            onAnalyticsClick={() => setAnalyticsOpen(true)}
            onFavoritesClick={() => setFavoritesOpen(true)}
            onTemplatesClick={() => setTemplatesOpen(true)}
            onPromptLibraryClick={() => setPromptLibraryOpen(true)}
            onSummaryClick={() => setSummaryOpen(true)}
            onShareClick={handleShare}
            onCommandPaletteClick={() => setCommandPaletteOpen(true)}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            isDarkMode={theme === 'dark'}
          />

          <div className="flex flex-col flex-1 min-w-0">
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              onSettingsClick={() => setSettingsOpen(true)}
              onSearchClick={() => setSearchOpen(true)}
              onAnalyticsClick={() => setAnalyticsOpen(true)}
              onFavoritesClick={() => setFavoritesOpen(true)}
              onTemplatesClick={() => setTemplatesOpen(true)}
              onPromptLibraryClick={() => setPromptLibraryOpen(true)}
              onSummaryClick={() => setSummaryOpen(true)}
              onShareClick={handleShare}
              onCommandPaletteClick={() => setCommandPaletteOpen(true)}
              onNewChat={createNewSession}
              currentSession={currentSession}
              allSessions={sessions}
            />
          
          <ChatWindow
            messages={currentSession?.messages || []}
            isTyping={isTyping}
            error={error}
            onExampleClick={handleSendMessage}
            onFeedback={addFeedback}
            getFeedback={getFeedback}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onRemoveFavorite={(messageId) => {
              const fav = getFavoriteByMessageId(messageId);
              if (fav) removeFavorite(fav.id);
            }}
            onCreateThread={handleCreateThread}
            existingCategories={getAllCategories()}
            existingTags={getAllTags()}
            getThreadCount={getThreadCount}
          />
          
            <InputBar
              onSend={handleSendMessage}
              disabled={isTyping}
            />
          </div>

          <AuthModal
            open={authModalOpen}
            onOpenChange={setAuthModalOpen}
          />

          <CommandPalette
            open={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
            sessions={sessions}
            prompts={prompts}
            onAction={handleCommandPaletteAction}
          />

        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onSave={updateSettings}
          onReset={resetSettings}
        />

        <SearchModal
          open={searchOpen}
          onOpenChange={setSearchOpen}
          sessions={sessions}
          onResultClick={handleSearchResultClick}
        />

        <AnalyticsModal
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
          sessions={sessions}
        />

        <ShortcutsModal
          open={shortcutsOpen}
          onOpenChange={setShortcutsOpen}
        />

        <FavoritesModal
          open={favoritesOpen}
          onOpenChange={setFavoritesOpen}
          favorites={favorites}
          categories={getAllCategories()}
          tags={getAllTags()}
          onRemove={removeFavorite}
          onUpdate={(id, updates) => {
            const fav = favorites.find(f => f.id === id);
            if (fav) {
              removeFavorite(id);
              addFavorite({ ...fav, ...updates });
            }
          }}
          onNavigate={handleFavoriteNavigate}
        />

        <TemplatesModal
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
        />

        <PromptLibraryModal
          open={promptLibraryOpen}
          onOpenChange={setPromptLibraryOpen}
          prompts={prompts}
          categories={getPromptCategories()}
          onSelectPrompt={handleSelectPrompt}
          onToggleFavorite={togglePromptFavorite}
          onAddNew={() => {
            setPromptLibraryOpen(false);
            toast({ title: 'Feature coming soon!', description: 'Prompt creation UI will be added' });
          }}
        />

        <PromptVariablesDialog
          open={promptVariablesOpen}
          onOpenChange={setPromptVariablesOpen}
          promptContent={selectedPrompt?.content || ''}
          variables={selectedPrompt?.variables || []}
          onSubmit={handlePromptWithVariables}
        />

        <SummaryModal
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
          summary={currentSession ? getSummary(currentSession.id) : null}
          isGenerating={isGenerating}
          onGenerate={handleGenerateSummary}
        />

          <ShareModal
            open={shareOpen}
            onOpenChange={setShareOpen}
            shareCode={shareCode}
            shareType="conversation"
          />
        </div>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default Index;
