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
      <GtkBox orientation="vertical" spacing={16} style={{ padding: 16 }}>
        <AddTodoForm
          value={title}
          isEditing={editingTodo !== null}
          onChange={setTitle}
          onSubmit={handleSubmit}
          onCancelEdit={cancelEditing}
        />
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
    </AdwClamp>
  );
}
