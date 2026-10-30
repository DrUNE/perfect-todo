import { AdwaitaProvider } from '@gtk-js/adwaita';
import { useEffect } from 'react';
import { useResolvedTheme } from '@/features/theme-switch/model';
import { TodoPage } from '@/pages/todo-page';

export function App() {
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <AdwaitaProvider colorScheme={resolvedTheme}>
      <TodoPage />
    </AdwaitaProvider>
  );
}
