import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Lightbulb, CheckSquare, Tag } from 'lucide-react';
import type { ConversationSummary } from '@/hooks/useSummarization';
import { motion } from 'framer-motion';

interface SummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ConversationSummary | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const SummaryModal = ({
  open,
  onOpenChange,
  summary,
  isGenerating,
  onGenerate,
}: SummaryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conversation Summary
          </DialogTitle>
          <DialogDescription>
            AI-generated overview with key insights
          </DialogDescription>
        </DialogHeader>

        {!summary && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              No summary generated yet for this conversation
            </p>
            <Button onClick={onGenerate}>
              Generate Summary
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Analyzing conversation and generating summary...
            </p>
          </div>
        )}

        {summary && !isGenerating && (
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {/* Overview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {summary.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        {summary.messageCount} messages
                      </Badge>
                      <Badge variant="outline">
                        {new Date(summary.generatedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Topics */}
              {summary.topics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Main Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {summary.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Key Points */}
              {summary.keyPoints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Key Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {summary.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Action Items */}
              {summary.actionItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        Action Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {summary.actionItems.map((item, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <div className="flex justify-end">
                <Button onClick={onGenerate} variant="outline" size="sm">
                  Regenerate Summary
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
