import { GtkEntry } from '@gtk-js/adwaita';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useDeviceInfo } from '@/shared/useDeviceInfo';

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
  // На тач-экране Esc может не быть (экранная клавиатура): отмена там — кнопкой в TodoToolbar.
  const { hasTouch } = useDeviceInfo();

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

  const placeholder = isEditing
    ? hasTouch
      ? 'Enter для сохранения'
      : 'Enter для сохранения, Esc для отмены'
    : 'Новая задача, Enter для добавления';

  return (
    <GtkEntry
      ref={inputRef}
      hexpand
      aria-label="Название задачи"
      placeholderText={placeholder}
      text={value}
      onChanged={onChange}
      onActivate={handleActivate}
      onKeyDown={handleKeyDown}
    />
  );
}
