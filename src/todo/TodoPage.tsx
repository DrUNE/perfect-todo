import { AdwClamp, AdwPreferencesGroup, GtkBox } from '@gtk-js/adwaita';
import { useState, type CSSProperties } from 'react';
import { AddTodoForm } from './AddTodoForm';
import { ClearCompletedButton } from './ClearCompletedButton';
import { TodoItem } from './TodoItem';
import { addTodo, editTodo, toggleTodo, useTodoList, type Todo } from './todoStore';

const fadeHeight = 24;
const fadeMask = `linear-gradient(to bottom, black calc(100% - ${fadeHeight}px), transparent)`;

// Закреплённая полоса с полем ввода. Её нижние fadeHeight px — отступ перед списком, в котором
// прокручиваемый список плавно уходит в прозрачность и размытие, а не обрезается резко.
// Полоса шире списка на отступ контейнера, чтобы тень списка не просвечивала по бокам.
const stickyBarStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  margin: '0 -16px',
  padding: `16px 16px ${fadeHeight}px`,
};

const fadeStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: `linear-gradient(to bottom, var(--window-bg-color) calc(100% - ${fadeHeight}px), transparent)`,
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  maskImage: fadeMask,
  WebkitMaskImage: fadeMask,
};

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
        <div style={stickyBarStyle}>
          <div aria-hidden style={fadeStyle} />
          <div style={{ position: 'relative' }}>
            <AddTodoForm
              value={title}
              isEditing={editingTodo !== null}
              onChange={setTitle}
              onSubmit={handleSubmit}
              onCancelEdit={cancelEditing}
            />
          </div>
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
