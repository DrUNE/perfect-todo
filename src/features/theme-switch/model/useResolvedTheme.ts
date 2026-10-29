import { useSyncExternalStore } from 'react';
import { resolveTheme } from './theme';
import { useThemePreference } from './themePreferenceStore';

const darkThemeQuery = '(prefers-color-scheme: dark)';

const subscribeToSystemTheme = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(darkThemeQuery);

  mediaQuery.addEventListener('change', onChange);

  return () => mediaQuery.removeEventListener('change', onChange);
};

const getSystemThemeSnapshot = () => window.matchMedia(darkThemeQuery).matches;
const getServerSystemThemeSnapshot = () => false;

export const useResolvedTheme = () => {
  const preference = useThemePreference((state) => state.preference);
  const isSystemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getServerSystemThemeSnapshot,
  );

  return resolveTheme(preference, isSystemDark ? 'dark' : 'light');
};
