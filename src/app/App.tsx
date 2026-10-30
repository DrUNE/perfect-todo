import { AdwaitaProvider, AdwHeaderBar } from '@gtk-js/adwaita';
import { useEffect } from 'react';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import { useResolvedTheme } from '@/theme/themeStore';
import { TodoPage } from '@/todo/TodoPage';

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
        className="flat"
        showStartTitleButtons={false}
        showEndTitleButtons={false}
        showTitle={false}
        end={<ThemeSwitcher />}
      />
      <TodoPage />
    </AdwaitaProvider>
  );
}
