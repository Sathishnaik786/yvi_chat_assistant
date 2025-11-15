import { useState, useEffect, useRef } from 'react';
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
  onSkipReveal?: (messageId: string) => void; // Add skip reveal callback
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
  isTyping = false,
  onSkipReveal, // Destructure the skip reveal callback
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
  
  // Ref for the message bubble container
  const bubbleRef = useRef<HTMLDivElement>(null);

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

  // Handle skip reveal on click for assistant messages
  const handleSkipReveal = () => {
    if (!isUser && onSkipReveal && message.role === 'assistant' && !message.isRevealed) {
      onSkipReveal(message.id);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip reveal with Ctrl+Enter when focused on the message
      if (e.ctrlKey && e.key === 'Enter' && bubbleRef.current && bubbleRef.current.contains(document.activeElement)) {
        handleSkipReveal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSkipReveal]);

  return (
    <div
      id={`message-${message.id}`}
      ref={bubbleRef}
      className={`px-2 md:px-4 py-2 md:py-3 ${
        isUser ? 'ml-auto float-right clear-both' : 'mr-auto float-left clear-both'
      } max-w-[90%] md:max-w-[85%] group transition-all`}
      onClick={handleSkipReveal}
      tabIndex={message.role === 'assistant' && !message.isRevealed ? 0 : -1}
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
            <div className="border-l-2 border-primary pl-2 bg-muted/50 rounded-r p-2">
              <ReactMarkdown>
                {message.displayedContent || ''}
              </ReactMarkdown>
            </div>
          ) : (
            <ReactMarkdown>
              {/* Use displayedContent if available (for progressive reveal), otherwise use full content */}
              {message.displayedContent !== undefined ? message.displayedContent : message.content}
            </ReactMarkdown>
          )}
          {/* Show blinking cursor while revealing */}
          {!isUser && !isTyping && !message.isRevealed && (
            <span className="ml-1 inline-block w-2 h-4 bg-primary animate-pulse"></span>
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
    </div>
  );
};