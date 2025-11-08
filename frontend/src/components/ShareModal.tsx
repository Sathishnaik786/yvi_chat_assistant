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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Share2, Link, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateShareableLink, copyToClipboard } from '@/utils/sharing';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareCode: string;
  shareType: 'conversation' | 'favorites' | 'template';
}

export const ShareModal = ({
  open,
  onOpenChange,
  shareCode,
  shareType,
}: ShareModalProps) => {
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

  const getShareTypeLabel = () => {
    switch (shareType) {
      case 'conversation':
        return 'Conversation';
      case 'favorites':
        return 'Favorites';
      case 'template':
        return 'Template';
      default:
        return 'Content';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {getShareTypeLabel()}
          </DialogTitle>
          <DialogDescription>
            Share this {shareType} with others via link or import code
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <Link className="h-4 w-4 mr-2" />
              Shareable Link
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Import Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shareable Link</CardTitle>
                <CardDescription>
                  Anyone with this link can view and import this {shareType}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input 
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
                
                <p className="text-xs text-muted-foreground">
                  💡 The link contains all the data encoded securely. No server storage required!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import Code</CardTitle>
                <CardDescription>
                  Use this code to import the {shareType} manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="import-code">Code</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="import-code"
                      value={shareCode} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopy('code')}
                    >
                      {copied === 'code' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                  <p className="font-medium">How to import:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Copy the code above</li>
                    <li>Open the import dialog in your app</li>
                    <li>Paste the code and confirm</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
