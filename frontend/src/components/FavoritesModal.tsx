import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Trash2, Edit2, Search, Tag, FolderOpen } from 'lucide-react';
import type { Favorite } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';

interface FavoritesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favorites: Favorite[];
  categories: string[];
  tags: string[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Favorite>) => void;
  onNavigate: (sessionId: string, messageId: string) => void;
}

export const FavoritesModal = ({
  open,
  onOpenChange,
  favorites,
  categories,
  tags,
  onRemove,
  onUpdate,
  onNavigate,
}: FavoritesModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => {
      const matchesSearch = 
        fav.messageContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.note?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || fav.category === selectedCategory;
      
      const matchesTag = 
        selectedTag === 'all' || fav.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [favorites, searchQuery, selectedCategory, selectedTag]);

  const handleEdit = (favorite: Favorite) => {
    setEditingId(favorite.id);
    setEditNote(favorite.note || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdate(id, { note: editNote });
    setEditingId(null);
    setEditNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Favorites & Bookmarks
          </DialogTitle>
          <DialogDescription>
            {favorites.length} saved messages
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <FolderOpen className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger>
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Favorites List */}
        <ScrollArea className="flex-1 pr-4">
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {favorites.length === 0 
                ? 'No favorites yet. Star messages to save them here.'
                : 'No favorites match your filters.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFavorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {favorite.messageRole}
                        </Badge>
                        {favorite.category && (
                          <Badge variant="secondary" className="text-xs">
                            <FolderOpen className="h-3 w-3 mr-1" />
                            {favorite.category}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium mb-1 truncate">
                        {favorite.sessionTitle}
                      </p>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {favorite.messageContent}
                      </p>

                      {favorite.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {favorite.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-2.5 w-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {editingId === favorite.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Add a note..."
                            rows={2}
                            className="text-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(favorite.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : favorite.note ? (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Note: {favorite.note}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onNavigate(favorite.sessionId, favorite.messageId)
                        }
                        title="Go to message"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(favorite)}
                        title="Edit note"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onRemove(favorite.id)}
                        title="Remove favorite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
