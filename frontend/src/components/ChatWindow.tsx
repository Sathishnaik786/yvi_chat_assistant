import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
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
  onShareClick?: (messageId: string) => void; // Add this new prop
  existingCategories?: string[];
  existingTags?: string[];
  getThreadCount?: (messageId: string) => number;
}

const EXAMPLE_PROMPTS = [
  {
    icon: '🏢',
    title: 'About Company',
    prompt: 'Tell me about YVI Tech Solutions',
  },
  {
    icon: '🛠️',
    title: 'Our Services',
    prompt: 'What services do you offer?',
  },
  {
    icon: '🌐',
    title: 'Domains & Expertise',
    prompt: 'What domains do you specialize in?',
  },
  {
    icon: '📍',
    title: 'Locations & Contact',
    prompt: 'Where are you located and how can I contact you?',
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
  onShareClick, // Add this new prop
  existingCategories,
  existingTags,
  getThreadCount,
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      // Try multiple approaches to ensure scrolling works
      if (scrollRef.current) {
        // Scroll the main container
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      if (innerRef.current) {
        // Scroll the inner container
        innerRef.current.scrollTo({
          top: innerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      // Fallback: Scroll to bottom using window
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    
    // Scroll immediately when messages or typing state changes
    scrollToBottom();
    
    // Scroll again after a short delay to ensure DOM updates are complete
    const timer1 = setTimeout(scrollToBottom, 50);
    const timer2 = setTimeout(scrollToBottom, 100);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [messages, isTyping]);

  return (
    <div className="h-full overflow-y-auto chat-scroll smooth-scroll auto-scroll" ref={scrollRef}>
      <div className="max-w-4xl mx-auto mobile-responsive min-h-full" ref={innerRef}>
        {messages.length === 0 && !isTyping && (
          <div className="flex items-center justify-center h-full min-h-[300px] md:min-h-[400px] px-2 md:px-4">
            <div className="text-center space-y-4 md:space-y-6 max-w-3xl">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <img 
                  src="/logo.png" 
                  alt="YVI Assistant Logo" 
                  className="w-12 h-8 md:w-12 md:h-12 object-contain"
                />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold">Welcome to YVI Assistant</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
                I'm here to help you learn about our company, services, and expertise. Ask me anything about YVI Tech Solutions:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-4 md:mt-6">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => onExampleClick(example.prompt)}
                    className="p-3 md:p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group touch-target"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">{example.icon}</span>
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
            onShareClick={onShareClick} // Add this new prop
            existingCategories={existingCategories}
            existingTags={existingTags}
            threadCount={getThreadCount?.(message.id)}
          />
        ))}

        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
};
