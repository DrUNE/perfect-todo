import { GtkButton } from '@gtk-js/adwaita';
import { clearCompletedTodos, useTodoList } from './todoStore';

export function ClearCompletedButton() {
  const hasCompletedTodos = useTodoList((state) => state.todoList.some((todo) => todo.isComplete));

  if (!hasCompletedTodos) {
    return null;
  }

  return (
    <GtkButton
      className="destructive-action"
      label="Удалить завершённые"
      onClicked={clearCompletedTodos}
    />
  );
}
