import { EditOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, type CheckboxChangeEvent } from 'antd';
import type { Todo } from '../../model';
import styles from './TodoItem.module.css';

type TodoItemProps = {
  todo: Todo;
  onToggle?: (id: Todo['id']) => void;
  onEdit?: () => void;
};

export function TodoItem({ todo, onToggle, onEdit }: TodoItemProps) {
  const handleChange = (event: CheckboxChangeEvent) => {
    if (event.target.checked !== todo.isComplete) {
      onToggle?.(todo.id);
    }
  };

  return (
    <Card className={styles.card}>
      <div className={styles.content}>
        <Checkbox checked={todo.isComplete} onChange={handleChange}>
          <span className={todo.isComplete ? styles.completed : undefined}>{todo.title}</span>
        </Checkbox>
        {onEdit && (
          <Button
            className={styles.editButton}
            type="text"
            shape="circle"
            icon={<EditOutlined />}
            aria-label="Редактировать задачу"
            onClick={onEdit}
          />
        )}
      </div>
    </Card>
  );
}
