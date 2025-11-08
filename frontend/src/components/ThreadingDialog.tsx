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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch } from 'lucide-react';

interface ThreadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateThread: (branchName: string) => void;
}

export const ThreadingDialog = ({
  open,
  onOpenChange,
  onCreateThread,
}: ThreadingDialogProps) => {
  const [branchName, setBranchName] = useState('');

  const handleCreate = () => {
    if (branchName.trim()) {
      onCreateThread(branchName.trim());
      setBranchName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Message Branch
          </DialogTitle>
          <DialogDescription>
            Explore an alternative conversation path from this message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              placeholder="e.g., Alternative approach, Detailed version"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>

          <p className="text-sm text-muted-foreground">
            This will create a new conversation thread starting from this message,
            allowing you to explore different responses without affecting the main conversation.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!branchName.trim()}>
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
