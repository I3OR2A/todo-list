import React, { createContext, useContext } from 'react';

type CompletionCelebrationContextValue = {
  showCelebration: (message?: string) => void;
};

const CompletionCelebrationContext = createContext<CompletionCelebrationContextValue | null>(null);

export function CompletionCelebrationProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: CompletionCelebrationContextValue }>) {
  return (
    <CompletionCelebrationContext.Provider value={value}>
      {children}
    </CompletionCelebrationContext.Provider>
  );
}

export function useCompletionCelebration() {
  const context = useContext(CompletionCelebrationContext);

  if (!context) {
    throw new Error('useCompletionCelebration must be used inside CompletionCelebrationProvider.');
  }

  return context;
}
