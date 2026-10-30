import {
  AdwClamp,
  AdwHeaderBar,
  AdwPreferencesGroup,
  AdwToolbarView,
  GtkBox,
} from '@gtk-js/adwaita';
import { useState } from 'react';
import { useTodoList, type Todo } from '@/entities/todo/model';
import { TodoItem } from '@/entities/todo/ui/TodoItem';
import { addTodo } from '@/features/todo-add/model';
import { AddTodoForm } from '@/features/todo-add/ui';
import { ClearCompletedButton } from '@/features/todo-clear-completed/ui';
import { editTodo } from '@/features/todo-edit/model';
import { ThemeSwitcher } from '@/features/theme-switch/ui';
import { toggleTodo } from '@/features/todo-toggle/model';

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
    <AdwToolbarView
      style={{ minHeight: '100dvh' }}
      topBars={
        <AdwHeaderBar
          showStartTitleButtons={false}
          showEndTitleButtons={false}
          showTitle={false}
          end={<ThemeSwitcher />}
        />
      }
      content={
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
      }
    />
  );
}
