import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Printer } from 'lucide-react';
import { exportToJSON, exportToMarkdown, exportToPDF, exportAllSessions } from '@/utils/export';
import type { ChatSession } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

interface ExportMenuProps {
  currentSession: ChatSession | undefined;
  allSessions: ChatSession[];
}

export const ExportMenu = ({ currentSession, allSessions }: ExportMenuProps) => {
  const { toast } = useToast();

  const handleExport = (format: 'json' | 'markdown' | 'pdf') => {
    if (!currentSession) {
      toast({
        title: 'No conversation',
        description: 'Start a conversation first before exporting',
        variant: 'destructive',
      });
      return;
    }

    try {
      switch (format) {
        case 'json':
          exportToJSON(currentSession);
          break;
        case 'markdown':
          exportToMarkdown(currentSession);
          break;
        case 'pdf':
          exportToPDF(currentSession);
          break;
      }
      
      toast({
        title: 'Export successful',
        description: `Conversation exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export conversation',
        variant: 'destructive',
      });
    }
  };

  const handleExportAll = (format: 'json' | 'markdown') => {
    if (allSessions.length === 0) {
      toast({
        title: 'No conversations',
        description: 'No conversations to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportAllSessions(allSessions, format);
      toast({
        title: 'Export successful',
        description: `All conversations exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export conversations',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Export conversation">
          <Download className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Current Chat</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <Printer className="mr-2 h-4 w-4" />
          Print as PDF
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Export All Chats</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExportAll('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          All as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportAll('markdown')}>
          <FileText className="mr-2 h-4 w-4" />
          All as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
