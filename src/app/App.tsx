import { AdwaitaProvider, AdwHeaderBar } from '@gtk-js/adwaita';
import { useEffect } from 'react';
import { cx } from '@/shared/cx';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import { useResolvedTheme } from '@/theme/themeStore';
import { ShortcutsHelp } from '@/todo/ShortcutsHelp';
import { TodoPage } from '@/todo/TodoPage';
import styles from './App.module.css';

export function App() {
  const resolvedTheme = useResolvedTheme();
  const { isMobile, isCompact, hasTouch, hasMouse, isFoldSpanned } = useDeviceInfo();

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const { dataset } = document.documentElement;

    dataset.mobile = String(isMobile);
    dataset.compact = String(isCompact);
    dataset.touch = String(hasTouch);
    dataset.mouse = String(hasMouse);
    dataset.foldSpanned = String(isFoldSpanned);
  }, [isMobile, isCompact, hasTouch, hasMouse, isFoldSpanned]);

  return (
    <AdwaitaProvider colorScheme={resolvedTheme}>
      <AdwHeaderBar
        className={cx('flat', styles.header)}
        showStartTitleButtons={false}
        showEndTitleButtons={false}
        showTitle={false}
        start={<ShortcutsHelp />}
        end={<ThemeSwitcher />}
      />
      <TodoPage />
    </AdwaitaProvider>
  );
}
