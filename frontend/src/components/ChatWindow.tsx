import { useEffect, useRef, useMemo } from 'react';
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
  onFeedback?: (messageId: string, rating: 'positive' | 'negative', comment: string, remove?: boolean) => void;
  getFeedback?: (messageId: string) => { rating: 'positive' | 'negative'; comment: string } | undefined;
  isFavorite?: (messageId: string) => boolean;
  onToggleFavorite?: (messageId: string, category: string, tags: string[], note: string) => void;
  onRemoveFavorite?: (messageId: string) => void;
  onCreateThread?: (messageId: string, branchName: string) => void;
  onShareClick?: (messageId: string) => void;
  existingCategories?: string[];
  existingTags?: string[];
  getThreadCount?: (messageId: string) => number;
  generateShareCode?: (message: Message) => string;
  onSkipReveal?: (messageId: string) => void; // Add skip reveal callback
}

const EXAMPLE_PROMPTS = [
  {
    icon: '🏢',
    title: 'About YVI Technologies',
    prompt: 'Can you tell me about YVI Technologies and what the company does?',
  },
  {
    icon: '🧠',
    title: 'AI & Automation',
    prompt: 'How does YVI Technologies use AI and automation in its solutions?',
  },
  {
    icon: '☁️',
    title: 'Cloud & DevOps',
    prompt: 'What kind of cloud and DevOps services does YVI Technologies provide?',
  },
  {
    icon: '💼',
    title: 'Enterprise Solutions',
    prompt: 'How does YVI Technologies help enterprises with ERP and digital transformation?',
  },
  {
    icon: '🔒',
    title: 'Cybersecurity',
    prompt: 'What cybersecurity and compliance services do you offer?',
  },
  {
    icon: '📍',
    title: 'Contact & Locations',
    prompt: 'Where is YVI Technologies located and how can I get in touch with the team?',
  },
  {
    icon: '🚀',
    title: 'Careers',
    prompt: 'How can I apply or join the team at YVI Technologies?',
  },
];

// Dynamic suggestion prompts based on context
const generateDynamicSuggestions = (lastMessage: string, messageHistory: Message[]): string[] => {
  const keywords = lastMessage.toLowerCase().match(/\b(\w+)\b/g) || [];

  // Base suggestions
  const baseSuggestions = [
    "Tell me more about your services",
    "Can you explain that in detail?",
    "Do you have any recent projects?"
  ];

  // Context: Services
  if (keywords.some(word => ['service', 'services', 'offer', 'solutions', 'project'].includes(word))) {
    return [
      "Do you provide end-to-end development?",
      "Can you customize solutions for clients?",
      "What industries do you work with most?"
    ];
  }

  // Context: Company
  if (keywords.some(word => ['company', 'about', 'organization', 'yvi', 'technologies'].includes(word))) {
    return [
      "Who founded YVI Technologies?",
      "What is YVI's mission and vision?",
      "How big is your team currently?"
    ];
  }

  // Context: Contact
  if (keywords.some(word => ['contact', 'location', 'address', 'email', 'reach'].includes(word))) {
    return [
      "Can I book a consultation with YVI?",
      "Do you have offices outside India?",
      "Is there a customer support email?"
    ];
  }

  // Context: AI & Technology
  if (keywords.some(word => ['ai', 'machine', 'intelligence', 'nlp', 'technology', 'software', 'development'].includes(word))) {
    return [
      "What tech stack does YVI use?",
      "Do you develop AI-powered applications?",
      "Can you integrate Gemini or GPT into products?"
    ];
  }

  // Context: Careers
  if (keywords.some(word => ['career', 'job', 'join', 'team', 'apply'].includes(word))) {
    return [
      "What roles are currently open?",
      "How can I apply for an internship?",
      "What's your recruitment process?"
    ];
  }

  // Context: Cloud/DevOps
  if (keywords.some(word => ['cloud', 'devops', 'infrastructure', 'aws', 'azure', 'gcp'].includes(word))) {
    return [
      "Do you manage cloud migrations?",
      "Do you use Kubernetes or Docker?",
      "How do you ensure scalability?"
    ];
  }

  // Context: Cybersecurity
  if (keywords.some(word => ['security', 'cybersecurity', 'audit', 'compliance', 'risk'].includes(word))) {
    return [
      "How do you handle data privacy?",
      "Do you offer vulnerability assessments?",
      "What compliance standards do you follow?"
    ];
  }

  return baseSuggestions;
};

// Helper function to get first 3 words
const getFirstThreeWords = (sentence: string): string => {
  return sentence.split(' ').slice(0, 3).join(' ');
};

// Custom hook to compare arrays deeply
const useDeepCompareMemo = <T,>(value: T): T => {
  const ref = useRef<T>(value);
  const isEqual = (a: T, b: T): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    return false;
  };
  
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
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
  generateShareCode,
  onSkipReveal, // Destructure the skip reveal callback
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useDeepCompareMemo(messages);
  const memoizedIsTyping = useMemo(() => isTyping, [isTyping]);

  // Determine if there's an assistant message currently being revealed
  const isAssistantRevealing = useMemo(() => {
    // Check if there's an assistant message that is not yet fully revealed
    return messages.some(msg => 
      msg.role === 'assistant' && 
      !msg.isRevealed && 
      msg.displayedContent !== undefined && 
      msg.displayedContent !== msg.content
    );
  }, [messages]);

  useEffect(() => {
    const scrollToBottom = () => {
      // Try multiple approaches to ensure scrolling works
      if (scrollRef.current) {
        // Scroll the main container (removed smooth behavior)
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'auto' // Changed from 'smooth' to 'auto'
        });
      }
      
      if (innerRef.current) {
        // Scroll the inner container (removed smooth behavior)
        innerRef.current.scrollTo({
          top: innerRef.current.scrollHeight,
          behavior: 'auto' // Changed from 'smooth' to 'auto'
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
  }, [memoizedMessages, memoizedIsTyping, isAssistantRevealing]); // Add isAssistantRevealing to dependencies

  return (
    <div className="h-full overflow-y-auto chat-scroll smooth-scroll" ref={scrollRef}>
      <div className="max-w-4xl mx-auto mobile-responsive min-h-full" ref={innerRef}>
        {memoizedMessages.length === 0 && !memoizedIsTyping && (
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

        {memoizedMessages.map((message, index) => {
          // Determine if this message should show typing effect
          // It should be the last message, currently typing, and from the assistant
          const isLastMessage = index === memoizedMessages.length - 1;
          const messageIsTyping = isLastMessage && memoizedIsTyping && message.role === 'assistant';
          
          return (
            <div key={message.id} className="clear-both">
              <MessageBubble
                key={`${message.id}-${messageIsTyping ? 'typing' : 'done'}`}
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
                shareCode={generateShareCode ? generateShareCode(message) : undefined}
                isTyping={messageIsTyping}
                onSkipReveal={onSkipReveal} // Pass the skip reveal callback
              />
              {/* Show dynamic follow-up suggestions directly below bot responses */}
              {message.role === 'assistant' && (index < memoizedMessages.length - 1 || !memoizedIsTyping) ? (
                <div className="px-4 pb-4 clear-both w-full">
                  <div className="flex gap-2 justify-start" style={{ flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {generateDynamicSuggestions(message.content, memoizedMessages.slice(0, index + 1)).slice(0, 3).map((prompt, promptIndex) => (
                      <button
                        key={promptIndex}
                        onClick={() => onExampleClick(prompt)}
                        className="px-3 py-2 text-sm rounded-lg border border-border bg-card hover:bg-accent transition-all duration-200 text-muted-foreground hover:text-foreground shadow-sm whitespace-nowrap"
                        style={{ flexShrink: 0 }}
                      >
                        {getFirstThreeWords(prompt)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Show typing indicator only when there's an actual typing state or assistant is revealing */}

      </div>
    </div>
  );
};