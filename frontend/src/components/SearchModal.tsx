import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatSession, Message } from '@/hooks/useChat';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: ChatSession[];
  onResultClick: (sessionId: string, messageId: string) => void;
}

interface SearchResult {
  sessionId: string;
  sessionTitle: string;
  message: Message;
  matchText: string;
}

export const SearchModal = ({
  open,
  onOpenChange,
  sessions,
  onResultClick,
}: SearchModalProps) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    sessions.forEach((session) => {
      session.messages.forEach((message) => {
        if (message.content.toLowerCase().includes(lowerQuery)) {
          const index = message.content.toLowerCase().indexOf(lowerQuery);
          const start = Math.max(0, index - 50);
          const end = Math.min(message.content.length, index + query.length + 50);
          const matchText = 
            (start > 0 ? '...' : '') +
            message.content.slice(start, end) +
            (end < message.content.length ? '...' : '');

          searchResults.push({
            sessionId: session.id,
            sessionTitle: session.title,
            message,
            matchText,
          });
        }
      });
    });

    return searchResults;
  }, [query, sessions]);

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result.sessionId, result.message.id);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Conversations</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <ScrollArea className="flex-1 mt-4">
          {query && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No messages found matching "{query}"
            </div>
          )}

          {!query && (
            <div className="text-center py-8 text-muted-foreground">
              Start typing to search across all conversations
            </div>
          )}

          <div className="space-y-2">
            {results.map((result, index) => (
              <Button
                key={`${result.sessionId}-${result.message.id}-${index}`}
                variant="ghost"
                className="w-full justify-start h-auto p-4 text-left"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span className="truncate">{result.sessionTitle}</span>
                    <span className="text-xs">
                      {new Date(result.message.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium capitalize">{result.message.role}:</span>{' '}
                    {result.matchText}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
