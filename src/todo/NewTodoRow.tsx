import { AdwEntryRow, AdwPreferencesGroup, GtkCheckButton } from '@gtk-js/adwaita';
import { useState, type KeyboardEvent } from 'react';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import { withViewTransition } from '@/shared/withViewTransition';
import { RowActions } from './RowActions';
import { addTodo } from './todoStore';

type NewTodoRowProps = {
  /** Стрелка вниз в поле: перейти к списку задач. */
  onNavigateDown: () => void;
  onAdded: () => void;
};

// Строка новой задачи: выглядит как строка списка, в которой название редактируется на месте.
// Enter создаёт задачу и она появляется первой в списке, а строка остаётся пустой для следующей.
export function NewTodoRow({ onNavigateDown, onAdded }: NewTodoRowProps) {
  const [title, setTitle] = useState('');
  const { hasTouch } = useDeviceInfo();
  const canConfirm = title.trim() !== '';

  const submit = () => {
    if (!canConfirm) {
      return;
    }

    withViewTransition(() => addTodo(title));
    setTitle('');
    onAdded();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setTitle('');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onNavigateDown();
    }
  };

  return (
    <AdwPreferencesGroup>
      <AdwEntryRow
        title="Новая задача"
        text={title}
        prefixWidget={<GtkCheckButton valign="center" disabled aria-hidden tabIndex={-1} />}
        suffixWidget={
          hasTouch &&
          title !== '' && (
            <RowActions canConfirm={canConfirm} onConfirm={submit} onCancel={() => setTitle('')} />
          )
        }
        onChanged={setTitle}
        onEntryActivated={submit}
        onEntryKeyDown={handleKeyDown}
      />
    </AdwPreferencesGroup>
  );
}
