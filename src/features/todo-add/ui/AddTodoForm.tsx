import { GtkEntry } from '@gtk-js/adwaita';
import { useEffect, useRef, type KeyboardEvent } from 'react';

type AddTodoFormProps = {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
};

export function AddTodoForm({
  value,
  isEditing,
  onChange,
  onSubmit,
  onCancelEdit,
}: AddTodoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleActivate = () => {
    if (value.trim()) {
      onSubmit();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && isEditing) {
      event.preventDefault();
      onCancelEdit();
    }
  };

  return (
    <GtkEntry
      ref={inputRef}
      hexpand
      aria-label="Название задачи"
      placeholderText={
        isEditing ? 'Enter для сохранения, Esc для отмены' : 'Новая задача, Enter для добавления'
      }
      text={value}
      onChanged={onChange}
      onActivate={handleActivate}
      onKeyDown={handleKeyDown}
    />
  );
}
