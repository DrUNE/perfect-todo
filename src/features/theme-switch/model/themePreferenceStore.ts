import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemePreference } from './theme';

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
