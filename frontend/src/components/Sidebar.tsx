import { useState } from 'react';
import { Plus, Trash2, MessageSquare, Folder, ChevronRight, ChevronDown, Tag, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChatSession } from '@/hooks/useChat';
import type { Folder as FolderType, Tag as TagType } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BulkActionsToolbar } from './BulkActionsToolbar';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  folders?: FolderType[];
  tags?: TagType[];
  onToggleFolder?: (id: string) => void;
  selectedFolderId?: string | null;
  onSelectFolder?: (id: string | null) => void;
  selectedTags?: string[];
  onToggleTag?: (tagId: string) => void;
  onReorderSessions?: (sessionIds: string[]) => void;
  onBulkDelete?: (sessionIds: string[]) => void;
  onBulkUpdate?: (sessionIds: string[], updates: Partial<ChatSession>) => void;
}

interface SortableSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  tags: TagType[];
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onSessionClick: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableSessionItem = ({
  session,
  isActive,
  tags,
  isSelected,
  onSelect,
  onSessionClick,
  onDelete,
}: SortableSessionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(session.id, checked as boolean)}
          className="ml-2"
        />
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className="flex-1 justify-start text-left pr-10"
          onClick={() => onSessionClick(session.id)}
        >
          <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="truncate block">{session.title}</span>
            {session.tags && session.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {session.tags.slice(0, 2).map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs h-4 px-1"
                      style={{ borderColor: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ) : null;
                })}
                {session.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    +{session.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export const Sidebar = ({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  isOpen,
  onClose,
  folders = [],
  tags = [],
  onToggleFolder,
  selectedFolderId,
  onSelectFolder,
  selectedTags = [],
  onToggleTag,
  onReorderSessions,
  onBulkDelete,
  onBulkUpdate,
}: SidebarProps) => {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const filteredSessions = selectedFolderId
    ? sessions.filter(s => s.folderId === selectedFolderId)
    : sessions;

  const tagFilteredSessions = selectedTags.length > 0
    ? filteredSessions.filter(s => 
        s.tags?.some(tag => selectedTags.includes(tag))
      )
    : filteredSessions;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tagFilteredSessions.findIndex((s) => s.id === active.id);
      const newIndex = tagFilteredSessions.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(tagFilteredSessions, oldIndex, newIndex);
      onReorderSessions?.(reordered.map(s => s.id));
    }
  };

  const handleSelectSession = (id: string, checked: boolean) => {
    setSelectedSessions(prev => 
      checked ? [...prev, id] : prev.filter(sid => sid !== id)
    );
  };

  const handleBulkMoveToFolder = (folderId: string | null) => {
    onBulkUpdate?.(selectedSessions, { folderId });
    setSelectedSessions([]);
  };

  const handleBulkAddTags = (tagIds: string[]) => {
    onBulkUpdate?.(selectedSessions, {
      tags: Array.from(new Set([
        ...(sessions.find(s => selectedSessions.includes(s.id))?.tags || []),
        ...tagIds
      ]))
    });
    setSelectedSessions([]);
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedSessions);
    setSelectedSessions([]);
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const folderSessions = sessions.filter(s => s.folderId === folder.id);
    const subfolders = folders.filter(f => f.parentId === folder.id);
    const hasSubfolders = subfolders.length > 0;

    return (
      <div key={folder.id}>
        <Button
          variant={selectedFolderId === folder.id ? 'secondary' : 'ghost'}
          className="w-full justify-start text-left"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelectFolder?.(folder.id)}
        >
          {hasSubfolders && (
            <span onClick={(e) => { e.stopPropagation(); onToggleFolder?.(folder.id); }} className="mr-1">
              {folder.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
          )}
          <Folder className="mr-2 h-4 w-4" style={{ color: folder.color }} />
          <span className="truncate">{folder.name}</span>
          <Badge variant="secondary" className="ml-auto">
            {folderSessions.length}
          </Badge>
        </Button>
        {hasSubfolders && folder.isExpanded && (
          <div>
            {subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar transform transition-transform duration-200 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-3 border-b border-sidebar-border">
            <Button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar
            selectedCount={selectedSessions.length}
            folders={folders}
            tags={tags}
            onMoveToFolder={handleBulkMoveToFolder}
            onAddTags={handleBulkAddTags}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedSessions([])}
          />

          {/* Folders */}
          {folders.length > 0 && (
            <div className="px-2 py-2 border-b border-sidebar-border">
              <div className="space-y-1">
                {folders.filter(f => f.parentId === null).map(folder => renderFolder(folder))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-2 py-2 border-b border-sidebar-border">
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                      borderColor: tag.color,
                    }}
                    onClick={() => onToggleTag?.(tag.id)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Chat History with Drag and Drop */}
          <ScrollArea className="flex-1 px-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tagFilteredSessions.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1 py-2">
                  {tagFilteredSessions.map((session) => (
                    <SortableSessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === currentSessionId}
                      tags={tags}
                      isSelected={selectedSessions.includes(session.id)}
                      onSelect={handleSelectSession}
                      onSessionClick={(id) => {
                        onSelectSession(id);
                        onClose();
                      }}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>

          {/* Clear All Button */}
          <div className="p-3 border-t border-sidebar-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Chats
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your chat conversations. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearAll}>
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </aside>
    </>
  );
};
