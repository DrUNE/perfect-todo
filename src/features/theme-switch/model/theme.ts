export type ThemePreference = 'light' | 'system' | 'dark';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

export const resolveTheme = (
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme => (preference === 'system' ? systemTheme : preference);
