import { AdwActionRow, GtkButton, GtkCheckButton } from '@gtk-js/adwaita';
import styles from './TodoItem.module.css';
import type { Todo } from './todoStore';

type TodoItemProps = {
  todo: Todo;
  /** Единственная строка списка в Tab-порядке (roving tabindex): остальные достижимы стрелками. */
  isTabStop: boolean;
  onToggle: (id: Todo['id']) => void;
  onEdit: (id: Todo['id']) => void;
  onDelete: (id: Todo['id']) => void;
};

const escapeMarkup = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Строка задачи в режиме просмотра. Сама строка фокусируется и управляется с клавиатуры (см. TodoList),
// кнопки внутри неё в Tab-порядок не входят, чтобы список проходился одной остановкой.
export function TodoItem({ todo, isTabStop, onToggle, onEdit, onDelete }: TodoItemProps) {
  const handleToggled = (isActive: boolean) => {
    if (isActive !== todo.isComplete) {
      onToggle(todo.id);
    }
  };

  return (
    <AdwActionRow
      className={styles.item}
      data-todo-id={todo.id}
      tabIndex={isTabStop ? 0 : -1}
      // Имя нужно браузеру, чтобы анимировать появление, удаление и сдвиг этой строки.
      style={{ viewTransitionName: `todo-${todo.id}` }}
      title={todo.isComplete ? `<s>${escapeMarkup(todo.title)}</s>` : todo.title}
      useMarkup={todo.isComplete}
      onDoubleClick={() => onEdit(todo.id)}
      prefixWidget={
        <GtkCheckButton
          valign="center"
          tabIndex={-1}
          aria-label={todo.title}
          active={todo.isComplete}
          onToggled={handleToggled}
        />
      }
      suffixWidget={
        todo.isComplete ? (
          <GtkButton
            valign="center"
            tabIndex={-1}
            className={`circular ${styles.action}`}
            hasFrame={false}
            iconName="UserTrash"
            aria-label="Удалить задачу"
            onClicked={() => onDelete(todo.id)}
          />
        ) : (
          <GtkButton
            valign="center"
            tabIndex={-1}
            className={`circular ${styles.action}`}
            hasFrame={false}
            iconName="DocumentEdit"
            aria-label="Редактировать задачу"
            onClicked={() => onEdit(todo.id)}
          />
        )
      }
    />
  );
}
