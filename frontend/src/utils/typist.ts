/**
 * Utility functions for typewriter-style text reveal animations
 * Supports character-by-character and word-by-word reveal with cancellation
 */

/**
 * Reveals text one character at a time
 * @param fullText The complete text to reveal
 * @param onUpdate Callback function called with current revealed text
 * @param speedMs Time interval between character reveals in milliseconds
 * @param signal Optional AbortSignal for cancellation
 */
export const revealByChar = (
  fullText: string,
  onUpdate: (current: string) => void,
  speedMs: number,
  signal?: AbortSignal
): Promise<void> => {
  return new Promise((resolve) => {
    // Handle reduced motion preference - reveal instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onUpdate(fullText);
      resolve();
      return;
    }

    let currentIndex = 0;
    
    const tick = () => {
      // Check if cancelled
      if (signal?.aborted) {
        onUpdate(fullText); // Show full text when cancelled
        resolve();
        return;
      }
      
      // Reveal next character
      if (currentIndex < fullText.length) {
        onUpdate(fullText.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(tick, speedMs);
      } else {
        resolve();
      }
    };
    
    // Start the reveal process
    tick();
  });
};

/**
 * Reveals text one word at a time
 * @param fullText The complete text to reveal
 * @param onUpdate Callback function called with current revealed text
 * @param speedMs Time interval between word reveals in milliseconds
 * @param signal Optional AbortSignal for cancellation
 */
export const revealByWord = (
  fullText: string,
  onUpdate: (current: string) => void,
  speedMs: number,
  signal?: AbortSignal
): Promise<void> => {
  return new Promise((resolve) => {
    // Handle reduced motion preference - reveal instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onUpdate(fullText);
      resolve();
      return;
    }

    // Split text into words while preserving spaces and punctuation
    const words = fullText.split(/(\s+)/).filter(word => word.length > 0);
    let currentIndex = 0;
    let currentText = '';
    
    const tick = () => {
      // Check if cancelled
      if (signal?.aborted) {
        onUpdate(fullText); // Show full text when cancelled
        resolve();
        return;
      }
      
      // Reveal next word
      if (currentIndex < words.length) {
        currentText += words[currentIndex];
        onUpdate(currentText);
        currentIndex++;
        setTimeout(tick, speedMs);
      } else {
        resolve();
      }
    };
    
    // Start the reveal process
    tick();
  });
};