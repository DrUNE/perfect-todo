import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import { setThemePreference, useThemePreference, type ThemePreference } from '../model';

const options = [
  {
    value: 'light' as const,
    icon: <SunOutlined aria-label="Светлая тема" />,
    tooltip: 'Светлая тема',
  },
  {
    value: 'system' as const,
    icon: <DesktopOutlined aria-label="Тема браузера" />,
    tooltip: 'Тема браузера',
  },
  {
    value: 'dark' as const,
    icon: <MoonOutlined aria-label="Тёмная тема" />,
    tooltip: 'Тёмная тема',
  },
];

export function ThemeSwitcher() {
  const preference = useThemePreference((state) => state.preference);

  return (
    <Segmented<ThemePreference>
      aria-label="Тема приложения"
      name="theme-preference"
      options={options}
      value={preference}
      onChange={setThemePreference}
    />
  );
}
