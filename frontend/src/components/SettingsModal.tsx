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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AISettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
  onReset: () => void;
}

const MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { value: 'gpt-4o', label: 'GPT-4o (Balanced)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Advanced)' },
];

const MAX_TOKENS_OPTIONS = [
  { value: 512, label: '512 (Short)' },
  { value: 1024, label: '1024 (Medium)' },
  { value: 2048, label: '2048 (Long)' },
  { value: 4096, label: '4096 (Very Long)' },
];

export const SettingsModal = ({
  open,
  onOpenChange,
  settings,
  onSave,
  onReset,
}: SettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Configure AI model parameters for your conversations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) =>
                setLocalSettings({ ...localSettings, model: value })
              }
            >
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[localSettings.temperature]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, temperature: value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Lower values make output more focused, higher values more creative
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Response Length</Label>
            <Select
              value={localSettings.maxTokens.toString()}
              onValueChange={(value) =>
                setLocalSettings({
                  ...localSettings,
                  maxTokens: parseInt(value),
                })
              }
            >
              <SelectTrigger id="maxTokens">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MAX_TOKENS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
