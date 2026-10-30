import { AdwActionRow, GtkButton, GtkCheckButton } from '@gtk-js/adwaita';
import type { Todo } from './todoStore';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: Todo['id']) => void;
  onEdit?: () => void;
  onDelete?: (id: Todo['id']) => void;
};

const escapeMarkup = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const handleToggled = (isActive: boolean) => {
    if (isActive !== todo.isComplete) {
      onToggle?.(todo.id);
    }
  };

  return (
    <AdwActionRow
      // Имя нужно браузеру, чтобы анимировать появление, удаление и сдвиг этой строки.
      style={{ viewTransitionName: `todo-${todo.id}` }}
      title={todo.isComplete ? `<s>${escapeMarkup(todo.title)}</s>` : todo.title}
      useMarkup={todo.isComplete}
      prefixWidget={
        <GtkCheckButton
          valign="center"
          aria-label={todo.title}
          active={todo.isComplete}
          onToggled={handleToggled}
        />
      }
      suffixWidget={
        todo.isComplete
          ? onDelete && (
              <GtkButton
                valign="center"
                className="circular"
                hasFrame={false}
                iconName="UserTrash"
                aria-label="Удалить задачу"
                onClicked={() => onDelete(todo.id)}
              />
            )
          : onEdit && (
              <GtkButton
                valign="center"
                className="circular"
                hasFrame={false}
                iconName="DocumentEdit"
                aria-label="Редактировать задачу"
                onClicked={onEdit}
              />
            )
      }
    />
  );
}
