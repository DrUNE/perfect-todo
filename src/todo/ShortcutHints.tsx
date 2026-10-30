import { useSyncExternalStore } from 'react';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import styles from './ShortcutHints.module.css';
import { useTodoList } from './todoStore';

type FocusContext = 'new' | 'row' | 'editor' | 'other';

type Hint = { keys: string; action: string };

// Где сейчас фокус: определяем по DOM, потому что строка ввода и строки списка не знают друг о друге.
const getFocusContext = (): FocusContext => {
  const element = document.activeElement;

  if (!(element instanceof HTMLElement)) {
    return 'other';
  }

  if (element.closest('[data-todo-editor]')) {
    return 'editor';
  }

  if (element.closest('[data-new-todo]')) {
    return 'new';
  }

  return element.matches('[data-todo-id]') ? 'row' : 'other';
};

const subscribeToFocus = (onChange: () => void) => {
  document.addEventListener('focusin', onChange);
  document.addEventListener('focusout', onChange);

  return () => {
    document.removeEventListener('focusin', onChange);
    document.removeEventListener('focusout', onChange);
  };
};

const useFocusContext = () =>
  useSyncExternalStore(subscribeToFocus, getFocusContext, () => 'other');

// Подсказки по клавишам, которые работают прямо сейчас: зависят от того, где фокус, и от состояния списка.
export function ShortcutHints() {
  const context = useFocusContext();
  const { hasTouch, hasMouse } = useDeviceInfo();
  const hasTodos = useTodoList((state) => state.todoList.length > 0);
  const hasCompletedTodos = useTodoList((state) => state.todoList.some((todo) => todo.isComplete));
  const canUndo = useTodoList((state) => state.deletedTodos.length > 0);

  // На устройстве только с касаниями клавиатуры, скорее всего, нет.
  if (hasTouch && !hasMouse) {
    return null;
  }

  const hints: Hint[] = [];

  if (context === 'new') {
    hints.push({ keys: 'Enter', action: 'добавить' }, { keys: 'Esc', action: 'очистить' });

    if (hasTodos) {
      hints.push({ keys: '↓', action: 'к списку' });
    }
  } else if (context === 'row') {
    hints.push(
      { keys: '↑ ↓', action: 'перейти' },
      { keys: 'Пробел', action: 'отметить' },
      { keys: 'Enter', action: 'изменить' },
      { keys: 'Delete', action: 'удалить' },
    );
  } else if (context === 'editor') {
    hints.push({ keys: 'Enter', action: 'сохранить' }, { keys: 'Esc', action: 'отменить' });
  }

  // В полях ввода Ctrl+Z, Shift+Delete и «?» принадлежат полю, поэтому там не предлагаем.
  if (context === 'row' || context === 'other') {
    if (hasCompletedTodos) {
      hints.push({ keys: 'Shift+Delete', action: 'удалить завершённые' });
    }

    if (canUndo) {
      hints.push({ keys: 'Ctrl+Z', action: 'вернуть удалённое' });
    }

    hints.push({ keys: '?', action: 'все клавиши' });
  }

  return (
    <div role="note" aria-label="Подсказка по горячим клавишам" className={styles.hints}>
      {hints.map((hint) => (
        <span key={hint.keys} className={styles.hint}>
          <kbd className={styles.key}>{hint.keys}</kbd>
          {hint.action}
        </span>
      ))}
    </div>
  );
}
