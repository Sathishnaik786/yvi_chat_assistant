import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Star, TrendingUp, Plus } from 'lucide-react';
import type { PromptTemplate } from '@/hooks/usePromptLibrary';
import { motion } from 'framer-motion';

interface PromptLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: PromptTemplate[];
  categories: string[];
  onSelectPrompt: (prompt: PromptTemplate) => void;
  onToggleFavorite: (id: string) => void;
  onAddNew: () => void;
}

export const PromptLibraryModal = ({
  open,
  onOpenChange,
  prompts,
  categories,
  onSelectPrompt,
  onToggleFavorite,
  onAddNew,
}: PromptLibraryModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');

  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'all' || prompt.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
    }

    return filtered;
  }, [prompts, searchQuery, selectedCategory, sortBy]);

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    onSelectPrompt(prompt);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Prompt Library</DialogTitle>
              <DialogDescription>
                {prompts.length} saved prompts with variables and templates
              </DialogDescription>
            </div>
            <Button onClick={onAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
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

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently used</SelectItem>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="alphabetical">A to Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prompts Grid */}
        <ScrollArea className="flex-1 pr-4">
          {filteredAndSortedPrompts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No prompts found. Create your first prompt!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAndSortedPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleSelectPrompt(prompt)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{prompt.title}</h4>
                      {prompt.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {prompt.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(prompt.id);
                      }}
                    >
                      <Star 
                        className={`h-4 w-4 ${prompt.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                      />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {prompt.category}
                    </Badge>
                    {prompt.variables.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {prompt.variables.length} variables
                      </Badge>
                    )}
                    {prompt.usageCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-2.5 w-2.5 mr-1" />
                        {prompt.usageCount}
                      </Badge>
                    )}
                  </div>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
