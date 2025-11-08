import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
  Command,
  Search,
  MessageSquare,
  Settings,
  BarChart3,
  Trash2,
  Keyboard,
  Star,
  FileCode,
  BookOpen,
  Folder,
} from 'lucide-react';

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon: React.ElementType;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

export const ShortcutsModal = ({ open, onOpenChange }: ShortcutsModalProps) => {
  const { t } = useTranslation();

  const categories: ShortcutCategory[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'P'], description: 'Open command palette', icon: Command },
        { keys: ['Ctrl', 'K'], description: 'Search conversations', icon: Search },
        { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', icon: Keyboard },
      ],
    },
    {
      title: 'Actions',
      shortcuts: [
        { keys: ['Ctrl', 'N'], description: 'New chat', icon: MessageSquare },
        { keys: ['Ctrl', ','], description: 'Open settings', icon: Settings },
        { keys: ['Ctrl', 'Shift', 'A'], description: 'View analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Chat Management',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'D'], description: 'Delete current chat', icon: Trash2 },
      ],
    },
    {
      title: 'Features',
      shortcuts: [
        { keys: ['Alt', 'F'], description: 'Open favorites', icon: Star },
        { keys: ['Alt', 'T'], description: 'Open templates', icon: FileCode },
        { keys: ['Alt', 'P'], description: 'Open prompt library', icon: BookOpen },
        { keys: ['Alt', 'M'], description: 'Manage folders', icon: Folder },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category, idx) => (
            <div key={category.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kIdx) => (
                        <span key={kIdx} className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="px-2 py-1 font-mono text-xs bg-background"
                          >
                            {key}
                          </Badge>
                          {kIdx < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {idx < categories.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Most shortcuts work with{' '}
            <Badge variant="outline" className="mx-1 font-mono text-xs">
              Cmd
            </Badge>{' '}
            instead of{' '}
            <Badge variant="outline" className="mx-1 font-mono text-xs">
              Ctrl
            </Badge>{' '}
            on Mac.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
