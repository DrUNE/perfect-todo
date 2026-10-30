import { AdwEntryRow } from '@gtk-js/adwaita';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import { RowActions } from './RowActions';
import type { Todo } from './todoStore';

type TodoItemEditorProps = {
  todo: Todo;
  /** `restoreFocus` — вернуть фокус на строку (false, если пользователь сам перешёл в другое место). */
  onSave: (title: string, restoreFocus: boolean) => void;
  onCancel: (restoreFocus: boolean) => void;
};

// Редактирование названия задачи на месте: строка превращается в поле ввода.
// Enter сохраняет, Esc отменяет, потеря фокуса сохраняет непустое название.
export function TodoItemEditor({ todo, onSave, onCancel }: TodoItemEditorProps) {
  const [title, setTitle] = useState(todo.title);
  const rowRef = useRef<HTMLDivElement>(null);
  const isFinished = useRef(false);
  const { hasTouch } = useDeviceInfo();
  const canConfirm = title.trim() !== '';

  // AdwEntryRow переносит свою строку в DOM списка уже после монтирования, и сфокусированное поле при
  // этом теряет фокус. Поэтому фокусируем поле на следующем кадре, а сохранение по потере фокуса
  // включаем только после этого.
  const isArmed = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const input = rowRef.current?.querySelector('input');

      input?.focus();
      input?.select();
      isArmed.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Завершаем редактирование один раз: Enter, Esc и потеря фокуса не должны сработать вместе.
  const finish = (restoreFocus: boolean, save: boolean) => {
    if (isFinished.current) {
      return;
    }

    isFinished.current = true;

    if (save && canConfirm) {
      onSave(title, restoreFocus);
    } else {
      onCancel(restoreFocus);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      finish(true, false);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (isArmed.current && !event.currentTarget.contains(event.relatedTarget)) {
      finish(false, true);
    }
  };

  return (
    <AdwEntryRow
      ref={rowRef}
      data-todo-editor
      title="Название задачи"
      text={title}
      suffixWidget={
        hasTouch && (
          <RowActions
            canConfirm={canConfirm}
            onConfirm={() => finish(true, true)}
            onCancel={() => finish(true, false)}
          />
        )
      }
      onChanged={setTitle}
      onEntryActivated={() => finish(true, true)}
      onEntryKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}
