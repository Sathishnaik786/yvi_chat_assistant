import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  initialRating: 'positive' | 'negative';
  onSubmit: (messageId: string, rating: 'positive' | 'negative', comment: string) => void;
}

export const FeedbackDialog = ({
  open,
  onOpenChange,
  messageId,
  initialRating,
  onSubmit,
}: FeedbackDialogProps) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<'positive' | 'negative'>(initialRating);
  const { toast } = useToast();

  const handleSubmit = () => {
    onSubmit(messageId, rating, comment);
    toast({
      title: 'Feedback submitted',
      description: 'Thank you for helping us improve!',
    });
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts on this response
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2 justify-center">
            <Button
              variant={rating === 'positive' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setRating('positive')}
              className="flex-1"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Helpful
            </Button>
            <Button
              variant={rating === 'negative' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setRating('negative')}
              className="flex-1"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Not Helpful
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Additional comments (optional)
            </label>
            <Textarea
              id="comment"
              placeholder="What was good or bad about this response?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
