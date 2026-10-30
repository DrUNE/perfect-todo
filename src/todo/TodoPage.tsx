import { AdwClamp, AdwPreferencesGroup } from '@gtk-js/adwaita';
import { useState } from 'react';
import { withViewTransition } from '@/shared/withViewTransition';
import { AddTodoForm } from './AddTodoForm';
import styles from './TodoPage.module.css';
import { TodoToolbar } from './TodoToolbar';
import { TodoItem } from './TodoItem';
import { addTodo, deleteTodo, editTodo, toggleTodo, useTodoList, type Todo } from './todoStore';

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

    withViewTransition(() => addTodo(title));
    setTitle('');
  };

  const handleDelete = (id: Todo['id']) => {
    if (editingTodo?.id === id) {
      cancelEditing();
    }

    withViewTransition(() => deleteTodo(id));
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
  };

  return (
    <AdwClamp maximumSize={400}>
      <div className={styles.content}>
        <div className={styles.stickyBar}>
          <div aria-hidden className={styles.fade} />
          <div className={styles.stickyContent}>
            <TodoToolbar
              isInputActive={editingTodo !== null || title !== ''}
              canConfirm={title.trim() !== ''}
              onConfirm={handleSubmit}
              onCancel={cancelEditing}
            />
            <div className={styles.input}>
              <AddTodoForm
                value={title}
                isEditing={editingTodo !== null}
                onChange={setTitle}
                onSubmit={handleSubmit}
                onCancelEdit={cancelEditing}
              />
            </div>
          </div>
        </div>
        {todoList.length > 0 && (
          <AdwPreferencesGroup className={styles.list}>
            {todoList.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onEdit={() => startEditing(todo)}
                onDelete={handleDelete}
              />
            ))}
          </AdwPreferencesGroup>
        )}
      </div>
    </AdwClamp>
  );
}
