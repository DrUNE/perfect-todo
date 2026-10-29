import { Input, type InputRef } from 'antd';
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import styles from './AddTodoForm.module.css';

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
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus({ cursor: 'all' });
    }
  }, [isEditing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        ref={inputRef}
        aria-label="Название задачи"
        placeholder={
          isEditing ? 'Enter для сохранения, Esc для отмены' : 'Новая задача, Enter для добавления'
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </form>
  );
}
