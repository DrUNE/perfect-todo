import { AdwClamp, AdwPreferencesGroup, GtkBox } from '@gtk-js/adwaita';
import { useState } from 'react';
import { AddTodoForm } from './AddTodoForm';
import { ClearCompletedButton } from './ClearCompletedButton';
import { TodoItem } from './TodoItem';
import { addTodo, editTodo, toggleTodo, useTodoList, type Todo } from './todoStore';

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
    <AdwClamp maximumSize={400}>
      <div style={{ padding: '0 16px 16px' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            // Фон шире списка на отступ контейнера, чтобы тень списка не просвечивала по бокам.
            margin: '0 -16px',
            padding: '16px',
            background: 'var(--window-bg-color)',
          }}
        >
          <AddTodoForm
            value={title}
            isEditing={editingTodo !== null}
            onChange={setTitle}
            onSubmit={handleSubmit}
            onCancelEdit={cancelEditing}
          />
        </div>
        <GtkBox orientation="vertical" spacing={16}>
          <ClearCompletedButton />
          {todoList.length > 0 && (
            <AdwPreferencesGroup>
              {todoList.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onEdit={() => startEditing(todo)}
                />
              ))}
            </AdwPreferencesGroup>
          )}
        </GtkBox>
      </div>
    </AdwClamp>
  );
}
