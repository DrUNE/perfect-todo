import { AdwToggleGroup, GtkImage } from '@gtk-js/adwaita';
import { setThemePreference, useThemePreference, type ThemePreference } from '../model';

const options = [
  { name: 'light', iconName: 'WeatherClear', title: 'Светлая тема' },
  { name: 'system', iconName: 'PreferencesDesktopDisplay', title: 'Тема браузера' },
  { name: 'dark', iconName: 'WeatherClearNight', title: 'Тёмная тема' },
] satisfies { name: ThemePreference; iconName: string; title: string }[];

const toggles = options.map(({ name, iconName, title }) => ({
  name,
  tooltip: title,
  child: <GtkImage iconName={iconName} valign="center" role="img" aria-label={title} />,
}));

export function ThemeSwitcher() {
  const preference = useThemePreference((state) => state.preference);

  return (
    <AdwToggleGroup
      aria-label="Тема приложения"
      toggles={toggles}
      activeName={preference}
      onToggleChanged={(_index, name) => setThemePreference(name as ThemePreference)}
    />
  );
}
