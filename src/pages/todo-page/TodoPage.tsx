import { useTodoList } from '@/entities/todo/model';
import { TodoItem } from '@/entities/todo/ui/TodoItem';
import { AddTodoForm } from '@/features/todo-add/ui';
import { toggleTodo } from '@/features/todo-toggle/model';
import styles from './TodoPage.module.css';

export function TodoPage() {
  const todoList = useTodoList((state) => state.todoList);

  return (
    <main className={styles.wrapper}>
      <AddTodoForm />
      <div className={styles.list}>
        {todoList.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} />
        ))}
      </div>
    </main>
  );
}
