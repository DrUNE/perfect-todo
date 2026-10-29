import { useState } from 'react';
import { useTodoList, type Todo } from '@/entities/todo/model';
import { TodoItem } from '@/entities/todo/ui/TodoItem';
import { addTodo } from '@/features/todo-add/model';
import { AddTodoForm } from '@/features/todo-add/ui';
import { ClearCompletedButton } from '@/features/todo-clear-completed/ui';
import { editTodo } from '@/features/todo-edit/model';
import { toggleTodo } from '@/features/todo-toggle/model';
import { flex } from '@styled-system/patterns';

export function TodoPage() {
  const todoList = useTodoList((state) => state.todoList);
  const [title, setTitle] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const cancelEditing = () => {
    setEditingTodo(null);
    setTitle('');
  };

  const handleSubmit = () => {
    if (editingTodo) {
      if (editTodo(editingTodo.id, title)) {
        cancelEditing();
      }
      return;
    }

    addTodo(title);
    setTitle('');
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
  };

  return (
    <main
      className={flex({
        direction: 'column',
        justify: 'center',
        width: 'min(calc(100% - 32px), 400px)',
        minHeight: '100vh',
        marginInline: 'auto',
        gap: '16px',
      })}
    >
      <AddTodoForm
        value={title}
        isEditing={editingTodo !== null}
        onChange={setTitle}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEditing}
      />
      <ClearCompletedButton />
      <div className={flex({ direction: 'column', gap: '16px' })}>
        {todoList.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onEdit={() => startEditing(todo)}
          />
        ))}
      </div>
    </main>
  );
}
