import { AdwaitaProvider, AdwHeaderBar, AdwToolbarView } from '@gtk-js/adwaita';
import { useEffect } from 'react';
import { ThemeSwitcher } from '@/theme/ThemeSwitcher';
import { useResolvedTheme } from '@/theme/themeStore';
import { TodoPage } from '@/todo/TodoPage';

export function App() {
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <AdwaitaProvider colorScheme={resolvedTheme}>
      <AdwToolbarView
        style={{ minHeight: '100dvh' }}
        topBars={
          <AdwHeaderBar
            showStartTitleButtons={false}
            showEndTitleButtons={false}
            showTitle={false}
            end={<ThemeSwitcher />}
          />
        }
        content={<TodoPage />}
      />
    </AdwaitaProvider>
  );
}
