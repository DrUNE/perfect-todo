import { ConfigProvider, theme } from 'antd';
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
    <ConfigProvider
      theme={{
        algorithm: resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <TodoPage />
    </ConfigProvider>
  );
}
