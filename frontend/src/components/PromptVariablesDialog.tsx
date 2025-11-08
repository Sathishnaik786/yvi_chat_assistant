import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';

interface PromptVariablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promptContent: string;
  variables: string[];
  onSubmit: (filledPrompt: string) => void;
}

export const PromptVariablesDialog = ({
  open,
  onOpenChange,
  promptContent,
  variables,
  onSubmit,
}: PromptVariablesDialogProps) => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize empty values for all variables
    const initialValues: Record<string, string> = {};
    variables.forEach(v => {
      initialValues[v] = '';
    });
    setValues(initialValues);
  }, [variables]);

  const handleSubmit = () => {
    let filledPrompt = promptContent;
    
    // Replace all variables with their values
    Object.entries(values).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      filledPrompt = filledPrompt.replace(regex, value);
    });

    onSubmit(filledPrompt);
    setValues({});
    onOpenChange(false);
  };

  const allFieldsFilled = variables.every(v => values[v]?.trim());

  // Determine if variable should use textarea (if it appears to expect longer content)
  const shouldUseTextarea = (variable: string) => {
    return ['code', 'text', 'content', 'description'].some(keyword => 
      variable.toLowerCase().includes(keyword)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fill in Variables</DialogTitle>
          <DialogDescription>
            Complete the template by filling in the required variables
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {variables.map((variable) => (
            <div key={variable} className="space-y-2">
              <Label htmlFor={variable} className="capitalize">
                {variable.replace(/_/g, ' ')}
              </Label>
              {shouldUseTextarea(variable) ? (
                <Textarea
                  id={variable}
                  value={values[variable] || ''}
                  onChange={(e) => setValues({ ...values, [variable]: e.target.value })}
                  placeholder={`Enter ${variable}...`}
                  rows={4}
                />
              ) : (
                <Input
                  id={variable}
                  value={values[variable] || ''}
                  onChange={(e) => setValues({ ...values, [variable]: e.target.value })}
                  placeholder={`Enter ${variable}...`}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!allFieldsFilled}>
            Use Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
