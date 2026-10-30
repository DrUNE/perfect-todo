import { create } from 'zustand';
import { useMediaQuery } from '@/shared/useMediaQuery';
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

export const useResolvedTheme = () => {
  const preference = useThemePreference((state) => state.preference);
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');

  return resolveTheme(preference, isSystemDark ? 'dark' : 'light');
};
