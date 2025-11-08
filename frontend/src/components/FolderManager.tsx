import { useState } from 'react';
import { Folder, Plus, Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import type { Folder as FolderType } from '@/hooks/useFolders';

interface FolderManagerProps {
  folders: FolderType[];
  onCreateFolder: (name: string, parentId: string | null, color?: string) => void;
  onUpdateFolder: (id: string, updates: Partial<FolderType>) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  getSubfolders: (parentId: string | null) => FolderType[];
}

export const FolderManager = ({
  folders,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onToggleFolder,
  getSubfolders,
}: FolderManagerProps) => {
  const { t } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName, selectedParentId, newFolderColor);
      setNewFolderName('');
      setNewFolderColor('#3b82f6');
      setSelectedParentId(null);
      setIsCreateOpen(false);
    }
  };

  const handleUpdate = () => {
    if (editingFolder && newFolderName.trim()) {
      onUpdateFolder(editingFolder.id, { name: newFolderName, color: newFolderColor });
      setEditingFolder(null);
      setNewFolderName('');
      setNewFolderColor('#3b82f6');
    }
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasSubfolders = subfolders.length > 0;

    return (
      <div key={folder.id}>
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-accent rounded-md group"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasSubfolders && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => onToggleFolder(folder.id)}
            >
              {folder.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          {!hasSubfolders && <div className="w-4" />}
          
          <Folder
            className="h-4 w-4 flex-shrink-0"
            style={{ color: folder.color }}
          />
          <span className="flex-1 truncate text-sm">{folder.name}</span>
          
          {folder.id !== 'root' && (
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setEditingFolder(folder);
                  setNewFolderName(folder.name);
                  setNewFolderColor(folder.color || '#3b82f6');
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDeleteFolder(folder.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {hasSubfolders && folder.isExpanded && (
          <div>
            {subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('folders.title')}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('folders.create')}
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        {folders.filter(f => f.parentId === null).map(folder => renderFolder(folder))}
      </ScrollArea>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('folders.newFolder')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('folders.folderName')}</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t('folders.folderName')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('folders.selectColor')}</Label>
              <Input
                type="color"
                value={newFolderColor}
                onChange={(e) => setNewFolderColor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('folders.rename')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('folders.folderName')}</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t('folders.folderName')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('folders.selectColor')}</Label>
              <Input
                type="color"
                value={newFolderColor}
                onChange={(e) => setNewFolderColor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFolder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
