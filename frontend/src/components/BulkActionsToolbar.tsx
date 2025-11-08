import { Folder, Tag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Folder as FolderType, Tag as TagType } from '@/hooks/useFolders';
import { useTranslation } from 'react-i18next';

interface BulkActionsToolbarProps {
  selectedCount: number;
  folders: FolderType[];
  tags: TagType[];
  onMoveToFolder: (folderId: string | null) => void;
  onAddTags: (tagIds: string[]) => void;
  onDelete: () => void;
  onClear: () => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  folders,
  tags,
  onMoveToFolder,
  onAddTags,
  onDelete,
  onClear,
}: BulkActionsToolbarProps) => {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-accent border-b border-border">
      <Badge variant="secondary" className="px-3">
        {selectedCount} selected
      </Badge>

      {/* Move to Folder */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Folder className="h-4 w-4 mr-2" />
            Move to Folder
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select Folder</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onMoveToFolder(null)}>
            <Folder className="h-4 w-4 mr-2" />
            No Folder
          </DropdownMenuItem>
          {folders.map((folder) => (
            <DropdownMenuItem key={folder.id} onClick={() => onMoveToFolder(folder.id)}>
              <Folder className="h-4 w-4 mr-2" style={{ color: folder.color }} />
              {folder.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Tags */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Tag className="h-4 w-4 mr-2" />
            Add Tags
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tags.map((tag) => (
            <DropdownMenuItem key={tag.id} onClick={() => onAddTags([tag.id])}>
              <Tag className="h-4 w-4 mr-2" style={{ color: tag.color }} />
              {tag.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete */}
      <Button variant="destructive" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      {/* Clear Selection */}
      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        <X className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
};
