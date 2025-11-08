import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Message } from '@/hooks/useChat';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  onExampleClick: (prompt: string) => void;
  onFeedback?: (messageId: string, rating: 'positive' | 'negative', comment: string) => void;
  getFeedback?: (messageId: string) => { rating: 'positive' | 'negative'; comment: string } | undefined;
  isFavorite?: (messageId: string) => boolean;
  onToggleFavorite?: (messageId: string, category: string, tags: string[], note: string) => void;
  onRemoveFavorite?: (messageId: string) => void;
  onCreateThread?: (messageId: string, branchName: string) => void;
  existingCategories?: string[];
  existingTags?: string[];
  getThreadCount?: (messageId: string) => number;
}

const EXAMPLE_PROMPTS = [
  {
    icon: '💡',
    title: 'Explain a concept',
    prompt: 'Explain quantum computing in simple terms',
  },
  {
    icon: '🎨',
    title: 'Creative writing',
    prompt: 'Write a short story about a robot learning to paint',
  },
  {
    icon: '💻',
    title: 'Code help',
    prompt: 'How do I optimize a React component for performance?',
  },
  {
    icon: '🌍',
    title: 'General knowledge',
    prompt: 'What are the main causes of climate change?',
  },
];

export const ChatWindow = ({ 
  messages, 
  isTyping, 
  error, 
  onExampleClick, 
  onFeedback, 
  getFeedback,
  isFavorite,
  onToggleFavorite,
  onRemoveFavorite,
  onCreateThread,
  existingCategories,
  existingTags,
  getThreadCount,
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="flex-1 chat-scroll" ref={scrollRef}>
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && !isTyping && (
          <div className="flex items-center justify-center h-full min-h-[400px] px-4">
            <div className="text-center space-y-6 max-w-3xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-semibold">Welcome to YVI Tech Assistant</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start a conversation by typing your message below or try one of these examples:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => onExampleClick(example.prompt)}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{example.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                          {example.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {example.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            feedback={getFeedback?.(message.id)}
            onFeedback={onFeedback}
            isFavorite={isFavorite?.(message.id)}
            onToggleFavorite={onToggleFavorite}
            onRemoveFavorite={onRemoveFavorite}
            onCreateThread={onCreateThread}
            existingCategories={existingCategories}
            existingTags={existingTags}
            threadCount={getThreadCount?.(message.id)}
          />
        ))}

        {isTyping && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
};
