import { AdwActionRow, GtkButton, GtkCheckButton } from '@gtk-js/adwaita';
import type { Todo } from '../../model';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: Todo['id']) => void;
  onEdit?: () => void;
};

const escapeMarkup = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function TodoItem({ todo, onToggle, onEdit }: TodoItemProps) {
  const handleToggled = (isActive: boolean) => {
    if (isActive !== todo.isComplete) {
      onToggle?.(todo.id);
    }
  };

  return (
    <AdwActionRow
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
        onEdit && (
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
