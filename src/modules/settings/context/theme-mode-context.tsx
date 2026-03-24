import React, { createContext, useContext } from 'react';

import { type AppSetting } from '@/modules/settings/domain/app-setting.types';

type ThemeModeContextValue = {
  setThemeMode: (themeMode: AppSetting['themeMode']) => void;
  themeMode: AppSetting['themeMode'];
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: ThemeModeContextValue }>) {
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeModeController() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeModeController must be used inside ThemeModeProvider.');
  }

  return context;
}
