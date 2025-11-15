export const TypingIndicator = () => {
  return (
    <div className="flex justify-start px-4 py-6">
      <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
};