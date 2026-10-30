import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resolveTheme, type ThemePreference } from './theme';

type ThemePreferenceState = {
  preference: ThemePreference;
};

export const useThemePreference = create<ThemePreferenceState>()(
  persist<ThemePreferenceState>(
    () => ({
      preference: 'system',
    }),
    {
      name: 'todo-theme-preference',
    },
  ),
);

export const setThemePreference = (preference: ThemePreference) => {
  useThemePreference.setState({ preference });
};

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
