import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Copy, 
  Check, 
  Share2, 
  Link, 
  MessageCircle, 
  Camera, 
  Briefcase, 
  Mail 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateShareableLink, copyToClipboard } from '@/utils/sharing';

interface SocialShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareCode: string;
  messageContent: string;
}

export const SocialShareDialog = ({
  open,
  onOpenChange,
  shareCode,
  messageContent,
}: SocialShareDialogProps) => {
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const { toast } = useToast();

  const shareableLink = generateShareableLink(shareCode);

  const handleCopy = async (type: 'link' | 'code') => {
    const text = type === 'link' ? shareableLink : shareCode;
    const success = await copyToClipboard(text);
    
    if (success) {
      setCopied(type);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopied(null), 2000);
    } else {
      toast({ 
        title: 'Failed to copy',
        variant: 'destructive' 
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out this message: ${messageContent.substring(0, 100)}...`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${shareableLink}`)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via web, so we'll copy the link
        handleCopy('link');
        toast({ title: 'Link copied! You can now paste it in Instagram.' });
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}&summary=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Check out this message&body=${encodeURIComponent(`${text}\n\n${shareableLink}`)}`, '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Message
          </DialogTitle>
          <DialogDescription>
            Share this message with others via social media or copy the link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={() => handleSocialShare('whatsapp')}
            >
              <MessageCircle className="h-6 w-6 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={() => handleSocialShare('instagram')}
            >
              <Camera className="h-6 w-6 text-pink-500" />
              <span className="text-xs">Instagram</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={() => handleSocialShare('linkedin')}
            >
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={() => handleSocialShare('email')}
            >
              <Mail className="h-6 w-6 text-gray-500" />
              <span className="text-xs">Email</span>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-link">Shareable Link</Label>
            <div className="flex gap-2">
              <Input 
                id="share-link"
                value={shareableLink} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopy('link')}
              >
                {copied === 'link' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};