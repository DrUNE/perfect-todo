import { EditOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, type CheckboxChangeEvent } from 'antd';
import { css, cx } from '@styled-system/css';
import { flex } from '@styled-system/patterns';
import type { Todo } from '../../model';

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
    <Card className={cx('group', css({ width: '100%' }))}>
      <div className={flex({ align: 'center', justify: 'space-between', gap: '8px' })}>
        <Checkbox checked={todo.isComplete} onChange={handleChange}>
          <span className={todo.isComplete ? css({ textDecoration: 'line-through' }) : undefined}>
            {todo.title}
          </span>
        </Checkbox>
        {onEdit && (
          <Button
            className={css({
              flexShrink: 0,
              opacity: { base: 0, _groupHover: 1, _focusVisible: 1 },
              '@media (hover: none)': { opacity: 1 },
            })}
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
