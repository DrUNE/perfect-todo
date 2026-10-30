import { GtkBox } from '@gtk-js/adwaita';
import { ClearCompletedButton } from './ClearCompletedButton';
import styles from './TodoToolbar.module.css';
import { useTodoList } from './todoStore';

type TodoToolbarProps = {
  onClearCompleted: () => void;
};

// Панель иконок-действий над списком. Место под неё зарезервировано всегда (см. TodoToolbar.module.css),
// чтобы появление и исчезновение кнопок не сдвигало строку ввода и список.
export function TodoToolbar({ onClearCompleted }: TodoToolbarProps) {
  const hasCompletedTodos = useTodoList((state) => state.todoList.some((todo) => todo.isComplete));

  return (
    <GtkBox spacing={8} className={styles.toolbar}>
      {hasCompletedTodos && <ClearCompletedButton onClick={onClearCompleted} />}
    </GtkBox>
  );
}
