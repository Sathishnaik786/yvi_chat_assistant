import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ThumbsUp, ThumbsDown, Check, Star, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { FeedbackDialog } from './FeedbackDialog';
import { AddFavoriteDialog } from './AddFavoriteDialog';
import { ThreadingDialog } from './ThreadingDialog';
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
  onFeedback?: (messageId: string, rating: 'positive' | 'negative', comment: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (messageId: string, category: string, tags: string[], note: string) => void;
  onRemoveFavorite?: (messageId: string) => void;
  onCreateThread?: (messageId: string, branchName: string) => void;
  existingCategories?: string[];
  existingTags?: string[];
  threadCount?: number;
}

export const MessageBubble = ({ 
  message, 
  feedback, 
  onFeedback,
  isFavorite,
  onToggleFavorite,
  onRemoveFavorite,
  onCreateThread,
  existingCategories = [],
  existingTags = [],
  threadCount = 0,
}: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<'positive' | 'negative'>('positive');
  const { toast } = useToast();

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackClick = (rating: 'positive' | 'negative') => {
    setSelectedRating(rating);
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = (messageId: string, rating: 'positive' | 'negative', comment: string) => {
    if (onFeedback) {
      onFeedback(messageId, rating, comment);
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
          ) : (
            <TypingEffect text={message.content} speed={20} />
          )}
        </div>
      </div>

      {!isUser && (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 md:h-8 px-1 md:px-2 touch-target",
                isFavorite && "text-yellow-500"
              )}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn("h-3 w-3", isFavorite && "fill-yellow-500")} />
            </Button>
          )}

          {onCreateThread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 md:h-8 px-1 md:px-2 relative touch-target"
              onClick={() => setThreadDialogOpen(true)}
              title="Create thread"
            >
              <GitBranch className="h-3 w-3" />
              {threadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] md:text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {threadCount}
                </span>
              )}
            </Button>
          )}
          
          {onFeedback && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 md:h-8 px-1 md:px-2 touch-target",
                  feedback?.rating === 'positive' && "text-green-500"
                )}
                onClick={() => handleFeedbackClick('positive')}
                title="Good response"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 md:h-8 px-1 md:px-2 touch-target",
                  feedback?.rating === 'negative' && "text-red-500"
                )}
                onClick={() => handleFeedbackClick('negative')}
                title="Bad response"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </>
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