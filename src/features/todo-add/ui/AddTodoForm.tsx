import { Button, Input } from 'antd';
import { useState, type FormEvent } from 'react';
import { addTodo } from '../model';
import styles from './AddTodoForm.module.css';

export function AddTodoForm() {
  const [title, setTitle] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    addTodo(title);
    setTitle('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        aria-label="Название задачи"
        placeholder="Новая задача"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button htmlType="submit">Add TODO</Button>
    </form>
  );
}
