import { Card, Checkbox, type CheckboxChangeEvent } from 'antd';
import type { Todo } from '../../model';
import styles from './TodoItem.module.css';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: Todo['id']) => void;
};

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const handleChange = (event: CheckboxChangeEvent) => {
    if (event.target.checked !== todo.isComplete) {
      onToggle?.(todo.id);
    }
  };

  return (
    <Card className={styles.card}>
      <Checkbox checked={todo.isComplete} onChange={handleChange}>
        <span className={todo.isComplete ? styles.completed : undefined}>
          {todo.title}
        </span>
      </Checkbox>
    </Card>
  );
}
