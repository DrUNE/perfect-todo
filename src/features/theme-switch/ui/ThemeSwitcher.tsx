import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import { css } from '@styled-system/css';
import { setThemePreference, useThemePreference, type ThemePreference } from '../model';

const switcherStyles = css({
  '& .ant-segmented-item-label': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .ant-segmented-item-icon': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
});

const options = [
  {
    value: 'light' as const,
    icon: <SunOutlined aria-hidden="true" />,
    label: <span className={css({ srOnly: true })}>Светлая тема</span>,
    tooltip: 'Светлая тема',
  },
  {
    value: 'system' as const,
    icon: <DesktopOutlined aria-hidden="true" />,
    label: <span className={css({ srOnly: true })}>Тема браузера</span>,
    tooltip: 'Тема браузера',
  },
  {
    value: 'dark' as const,
    icon: <MoonOutlined aria-hidden="true" />,
    label: <span className={css({ srOnly: true })}>Тёмная тема</span>,
    tooltip: 'Тёмная тема',
  },
];

export function ThemeSwitcher() {
  const preference = useThemePreference((state) => state.preference);

  return (
    <Segmented<ThemePreference>
      className={switcherStyles}
      aria-label="Тема приложения"
      name="theme-preference"
      options={options}
      value={preference}
      onChange={setThemePreference}
    />
  );
}
