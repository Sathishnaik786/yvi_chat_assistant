import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ConversationTemplate } from '@/hooks/useTemplates';
import { motion } from 'framer-motion';

interface TemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ConversationTemplate[];
  onSelectTemplate: (template: ConversationTemplate) => void;
}

const categoryColors: Record<string, string> = {
  coding: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  writing: 'bg-green-500/10 text-green-500 border-green-500/20',
  analysis: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  creative: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  custom: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export const TemplatesModal = ({
  open,
  onOpenChange,
  templates,
  onSelectTemplate,
}: TemplatesModalProps) => {
  const handleSelectTemplate = (template: ConversationTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Conversation Templates</DialogTitle>
          <DialogDescription>
            Start with a pre-configured template for common scenarios
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:bg-accent transition-colors h-full"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Badge 
                        variant="outline" 
                        className={categoryColors[template.category]}
                      >
                        {template.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {template.settings.model}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-2 text-muted-foreground">
                        Starter prompts:
                      </p>
                      <div className="space-y-1.5">
                        {template.starterPrompts.slice(0, 2).map((prompt, i) => (
                          <p key={i} className="text-xs text-muted-foreground truncate">
                            • {prompt}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Temperature: {template.settings.temperature}</span>
                      <span>Max tokens: {template.settings.maxTokens}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
