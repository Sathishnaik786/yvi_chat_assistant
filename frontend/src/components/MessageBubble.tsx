import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ThumbsUp, ThumbsDown, Check, Star, GitBranch, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { FeedbackDialog } from './FeedbackDialog';
import { AddFavoriteDialog } from './AddFavoriteDialog';
import { ThreadingDialog } from './ThreadingDialog';
import { SocialShareDialog } from './SocialShareDialog';
import ReactMarkdown from 'react-markdown';
import type { Message } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

// Typing effect component for bot messages
const TypingEffect = ({ text, speed = 30 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

interface MessageBubbleProps {
  message: Message;
  feedback?: { rating: 'positive' | 'negative'; comment: string };
  onFeedback?: (messageId: string, rating: 'positive' | 'negative', comment: string, remove?: boolean) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (messageId: string, category: string, tags: string[], note: string) => void;
  onRemoveFavorite?: (messageId: string) => void;
  onCreateThread?: (messageId: string, branchName: string) => void;
  onShareClick?: (messageId: string) => void;
  existingCategories?: string[];
  existingTags?: string[];
  threadCount?: number;
  shareCode?: string;
  isTyping?: boolean;
}

export const MessageBubble = ({ 
  message, 
  feedback, 
  onFeedback,
  isFavorite,
  onToggleFavorite,
  onRemoveFavorite,
  onCreateThread,
  onShareClick,
  existingCategories = [],
  existingTags = [],
  threadCount = 0,
  shareCode,
  isTyping = false, // Add default value
}: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [socialShareDialogOpen, setSocialShareDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<'positive' | 'negative'>('positive');
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackClick = (rating: 'positive' | 'negative') => {
    if (rating === 'positive') {
      // Toggle positive feedback
      if (onFeedback) {
        // If already positively rated, remove the rating
        if (feedback?.rating === 'positive') {
          onFeedback(message.id, 'positive', '', true); // true to indicate removal
        } else {
          // Otherwise, set positive rating
          onFeedback(message.id, 'positive', '');
          setShowThankYou(true);
          setTimeout(() => setShowThankYou(false), 3000);
        }
      }
    } else {
      // For negative feedback, open the dialog
      setSelectedRating(rating);
      setFeedbackDialogOpen(true);
    }
  };

  const handleFeedbackSubmit = (messageId: string, rating: 'positive' | 'negative', comment: string) => {
    if (onFeedback) {
      onFeedback(messageId, rating, comment);
    }
    if (rating === 'negative') {
      toast({ title: 'Feedback submitted', description: 'Thank you for helping us improve!' });
      // Hide the dislike button after submitting negative feedback
      setTimeout(() => {
        setFeedbackDialogOpen(false);
      }, 100);
    } else {
      setFeedbackDialogOpen(false);
    }
  };

  const handleShareClick = () => {
    if (shareCode) {
      setSocialShareDialogOpen(true);
    } else if (onShareClick) {
      onShareClick(message.id);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite && onRemoveFavorite) {
      onRemoveFavorite(message.id);
      toast({ title: 'Removed from favorites' });
    } else {
      setFavoriteDialogOpen(true);
    }
  };

  const handleAddFavorite = (category: string, tags: string[], note: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(message.id, category, tags, note);
      toast({ title: 'Added to favorites' });
    }
  };

  const handleCreateThread = (branchName: string) => {
    if (onCreateThread) {
      onCreateThread(message.id, branchName);
      toast({ title: 'Thread created', description: branchName });
    }
  };

  return (
    <motion.div
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-2 md:px-4 py-2 md:py-3 ${
        isUser ? 'ml-auto float-right clear-both' : 'mr-auto float-left clear-both'
      } max-w-[90%] md:max-w-[85%] group transition-all`}
    >
      <div className={`rounded-2xl px-3 md:px-4 py-2 md:py-3 inline-block ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none break-words">
          {isUser ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : isTyping ? (
            <TypingEffect text={message.content} speed={20} />
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>

      {!isUser && (
        <div className="flex items-center gap-1 mt-2 opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 md:h-8 px-1 md:px-2 touch-target"
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        
          {onFeedback && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 md:h-8 px-1 md:px-2 touch-target"
                onClick={() => handleFeedbackClick('positive')}
                title="Good response"
              >
                <ThumbsUp 
                  className="h-3 w-3" 
                  fill={feedback?.rating === 'positive' ? '#10B981' : 'none'} 
                />
              </Button>
              {showThankYou && (
                <div className="absolute mt-8 ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Thank you for your feedback!
                </div>
              )}
              {/* Only show dislike button if there's no negative feedback yet */}
              {feedback?.rating !== 'negative' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 md:h-8 px-1 md:px-2 touch-target"
                  onClick={() => handleFeedbackClick('negative')}
                  title="Bad response"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        
          {(onShareClick || shareCode) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 md:h-8 px-1 md:px-2 touch-target"
              onClick={handleShareClick}
              title="Share message"
            >
              <Share2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {onFeedback && (
        <FeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          messageId={message.id}
          initialRating={selectedRating}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {shareCode && (
        <SocialShareDialog
          open={socialShareDialogOpen}
          onOpenChange={setSocialShareDialogOpen}
          shareCode={shareCode}
          messageContent={message.content}
        />
      )}

      {onToggleFavorite && (
        <AddFavoriteDialog
          open={favoriteDialogOpen}
          onOpenChange={setFavoriteDialogOpen}
          onAdd={handleAddFavorite}
          existingCategories={existingCategories}
          existingTags={existingTags}
        />
      )}

      {onCreateThread && (
        <ThreadingDialog
          open={threadDialogOpen}
          onOpenChange={setThreadDialogOpen}
          onCreateThread={handleCreateThread}
        />
      )}
    </motion.div>
  );
};