import { GtkBox } from '@gtk-js/adwaita';
import { ClearCompletedButton } from './ClearCompletedButton';
import styles from './TodoToolbar.module.css';
import { useTodoList } from './todoStore';

type TodoToolbarProps = {
  /** Над строкой ввода (мышь) или закреплена внизу окна (только касания). */
  placement: 'top' | 'bottom';
  onClearCompleted: () => void;
};

// Панель иконок-действий над списком. Сверху место под неё зарезервировано всегда (см. TodoToolbar.module.css),
// внизу панель закреплена поверх страницы: в обоих случаях появление кнопки не сдвигает остальное.
export function TodoToolbar({ placement, onClearCompleted }: TodoToolbarProps) {
  const hasCompletedTodos = useTodoList((state) => state.todoList.some((todo) => todo.isComplete));
  const clearButton = hasCompletedTodos ? (
    <ClearCompletedButton onClick={onClearCompleted} />
  ) : null;

  if (placement === 'bottom') {
    return clearButton && <div className={styles.bottomBar}>{clearButton}</div>;
  }

  return (
    <GtkBox spacing={8} className={styles.toolbar}>
      {clearButton}
    </GtkBox>
  );
}
