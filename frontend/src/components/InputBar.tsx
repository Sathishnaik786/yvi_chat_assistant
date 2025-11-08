import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const InputBar = ({ onSend, disabled }: InputBarProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, transcript, startRecording, stopRecording, clearTranscript } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
      clearTranscript();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening...' : 'Message YVI Tech Assistant...'}
              disabled={disabled}
              className="min-h-[52px] max-h-[200px] resize-none pr-20"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  isRecording && 'text-red-500 animate-pulse'
                )}
                onClick={handleVoiceToggle}
                disabled={disabled}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="h-[52px] px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {isRecording ? 'Recording... Click mic to stop' : 'Press Enter to send, Shift + Enter for new line'}
        </p>
      </div>
    </div>
  );
};
