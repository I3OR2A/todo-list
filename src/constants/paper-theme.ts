import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import { Colors } from '@/constants/theme';

export function getAppThemes(colorScheme: 'light' | 'dark') {
  const palette = Colors[colorScheme];

  const paperTheme = colorScheme === 'dark'
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: '#ff8d7e',
          secondary: '#f1b6a5',
          background: palette.background,
          surface: palette.backgroundElement,
          surfaceVariant: palette.backgroundSelected,
          onSurface: palette.text,
          onSurfaceVariant: palette.textSecondary,
          outline: palette.backgroundSelected,
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: '#c84d43',
          secondary: '#91645d',
          background: palette.background,
          surface: palette.backgroundElement,
          surfaceVariant: palette.backgroundSelected,
          onSurface: palette.text,
          onSurfaceVariant: palette.textSecondary,
          outline: palette.backgroundSelected,
        },
      };

  const navigationTheme = colorScheme === 'dark'
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          background: palette.background,
          card: palette.backgroundElement,
          text: palette.text,
          border: palette.backgroundSelected,
          primary: paperTheme.colors.primary,
        },
      }
    : {
        ...NavigationDefaultTheme,
        colors: {
          ...NavigationDefaultTheme.colors,
          background: palette.background,
          card: palette.backgroundElement,
          text: palette.text,
          border: palette.backgroundSelected,
          primary: paperTheme.colors.primary,
        },
      };

  return {
    navigationTheme,
    paperTheme,
  };
}
