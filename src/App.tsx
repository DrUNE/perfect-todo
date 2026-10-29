import styles from '@/App.module.css';
import { addTodo, useTodoList } from '@/model/todoStore';
import { Button, Card, Checkbox, Input, type InputRef } from 'antd';
import { useRef } from 'react';

export function App() {
  const todoList = useTodoList((state) => state.todoList);
  const inputRef = useRef<InputRef>(null);
  const handleAddTodoClick = () => {
    addTodo({ title: inputRef.current?.input?.value ?? '' });
  };
  return (
    <div className={styles.wrapper}>
      <Input style={{ width: 300 }} ref={inputRef} />
      <Button onClick={handleAddTodoClick}>Add TODO</Button>
      {todoList.map(({ id, isComplete, title }) => (
        <Card key={id} className={styles.card}>
          <Checkbox checked={isComplete} />
          <span>{title}</span>
        </Card>
      ))}
    </div>
  );
}
