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
    prompt: 'Tell me about YVI Technologies',
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

// Dynamic suggestion prompts based on context
const generateDynamicSuggestions = (lastMessage: string, messageHistory: Message[]): string[] => {
  // Extract keywords from the last message
  const keywords = lastMessage.toLowerCase().match(/\b(\w+)\b/g) || [];
  
  // Base suggestions
  const baseSuggestions = [
    "Tell me more details",
    "What else should I know",
    "How does this work"
  ];
  
  // Context-based suggestions
  if (keywords.some(word => ['service', 'services', 'offer', 'offering'].includes(word))) {
    return [
      "What industries do you serve?",
      "Do you offer custom solutions?",
      "What's your pricing model?"
    ];
  }
  
  if (keywords.some(word => ['company', 'about', 'organization'].includes(word))) {
    return [
      "When was YVI Technologies founded?",
      "What's your company culture?",
      "How many employees do you have?"
    ];
  }
  
  if (keywords.some(word => ['contact', 'location', 'address', 'phone', 'email'].includes(word))) {
    return [
      "What are your office hours?",
      "Do you have international offices?",
      "What's the best way to reach you?"
    ];
  }
  
  if (keywords.some(word => ['technology', 'tech', 'software', 'development'].includes(word))) {
    return [
      "What technologies do you use?",
      "Do you provide technical support?",
      "What's your development process?"
    ];
  }
  
  // Default to base suggestions if no specific context
  return baseSuggestions;
};

// Helper function to get first 3 words
const getFirstThreeWords = (sentence: string): string => {
  return sentence.split(' ').slice(0, 3).join(' ');
};

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
  onShareClick,
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
          <div className="flex items-center justify-center h-full min-h-screen w-full px-4">
            <div className="text-center space-y-6 max-w-2xl mx-auto py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="YVI Assistant Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome to YVI Assistant
                </h2>
                <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  I'm here to help you learn about our company, services, and expertise. Ask me anything about YVI Technologies:
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => onExampleClick(example.prompt)}
                    className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-all duration-200 text-left group touch-target shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{example.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {example.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
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

        {messages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble
              key={message.id}
              message={message}
              feedback={getFeedback?.(message.id)}
              onFeedback={onFeedback}
              isFavorite={isFavorite?.(message.id)}
              onToggleFavorite={onToggleFavorite}
              onRemoveFavorite={onRemoveFavorite}
              onCreateThread={onCreateThread}
              onShareClick={onShareClick}
              existingCategories={existingCategories}
              existingTags={existingTags}
              threadCount={getThreadCount?.(message.id)}
            />
            {/* Show dynamic follow-up suggestions after bot responses */}
            {message.role === 'assistant' && (index < messages.length - 1 || !isTyping) ? (
              <div className="px-4 pb-4">
                <div className="flex gap-2 justify-start flex-wrap">
                  {generateDynamicSuggestions(message.content, messages.slice(0, index + 1)).slice(0, 3).map((prompt, promptIndex) => (
                    <button
                      key={promptIndex}
                      onClick={() => onExampleClick(prompt)}
                      className="px-3 py-2 text-sm rounded-lg border border-border bg-card hover:bg-accent transition-all duration-200 text-muted-foreground hover:text-foreground shadow-sm whitespace-nowrap"
                    >
                      {getFirstThreeWords(prompt)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
};
