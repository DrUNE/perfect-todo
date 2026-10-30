import { AdwActionRow, GtkBox, GtkButton } from '@gtk-js/adwaita';
import { useHorizontalSwipe } from '@/shared/useHorizontalSwipe';
import styles from './TodoItem.module.css';
import type { Todo } from './todoStore';

type TodoItemProps = {
  todo: Todo;
  /** Единственная строка списка в Tab-порядке (roving tabindex): остальные достижимы стрелками. */
  isTabStop: boolean;
  /** Кнопка «Отметить как сделанное» (устройства с мышью). На касаниях статус меняется свайпом. */
  showStatusButton: boolean;
  onToggle: (id: Todo['id']) => void;
  onEdit: (id: Todo['id']) => void;
  onDelete: (id: Todo['id']) => void;
};

const escapeMarkup = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Строка задачи в режиме просмотра. Сама строка фокусируется и управляется с клавиатуры (см. TodoList),
// кнопки внутри неё в Tab-порядок не входят, чтобы список проходился одной остановкой.
// Статус «сделано» меняют кнопка (мышь), горизонтальный свайп (касания) и Пробел (клавиатура).
export function TodoItem({
  todo,
  isTabStop,
  showStatusButton,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const { swipeProps, swipeStyle } = useHorizontalSwipe({ onSwipe: () => onToggle(todo.id) });

  return (
    <AdwActionRow
      className={styles.item}
      data-todo-id={todo.id}
      tabIndex={isTabStop ? 0 : -1}
      // Состояние выполнено передаётся не только зачёркиванием, но и именем строки.
      aria-label={todo.isComplete ? `${todo.title}, выполнено` : todo.title}
      // Имя нужно браузеру, чтобы анимировать появление, удаление и сдвиг этой строки.
      style={{ ...swipeStyle, viewTransitionName: `todo-${todo.id}` }}
      title={todo.isComplete ? `<s>${escapeMarkup(todo.title)}</s>` : todo.title}
      useMarkup={todo.isComplete}
      onDoubleClick={() => onEdit(todo.id)}
      suffixWidget={
        <GtkBox spacing={4} valign="center">
          {showStatusButton && (
            <GtkButton
              tabIndex={-1}
              className={`circular ${styles.action}`}
              hasFrame={false}
              iconName={todo.isComplete ? 'EditUndo' : 'ObjectSelect'}
              aria-label={todo.isComplete ? 'Вернуть в работу' : 'Отметить как сделанное'}
              tooltipText={todo.isComplete ? 'Вернуть в работу' : 'Отметить как сделанное'}
              onClicked={() => onToggle(todo.id)}
            />
          )}
          {todo.isComplete ? (
            <GtkButton
              tabIndex={-1}
              className={`circular ${styles.action}`}
              hasFrame={false}
              iconName="UserTrash"
              aria-label="Удалить задачу"
              onClicked={() => onDelete(todo.id)}
            />
          ) : (
            <GtkButton
              tabIndex={-1}
              className={`circular ${styles.action}`}
              hasFrame={false}
              iconName="DocumentEdit"
              aria-label="Редактировать задачу"
              onClicked={() => onEdit(todo.id)}
            />
          )}
        </GtkBox>
      }
      {...swipeProps}
    />
  );
}
