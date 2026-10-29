import { beforeEach, describe, expect, it } from 'vitest';
import { addTodo, setTodoList, useTodoList } from './todoStore';

describe('todoStore', () => {
  beforeEach(() => {
    setTodoList({ todoList: [] });
  });

  it('adds a todo with generated id and incomplete status', () => {
    addTodo({ title: 'Изучить Vitest' });

    const [todo] = useTodoList.getState().todoList;

    expect(todo).toMatchObject({
      title: 'Изучить Vitest',
      isComplete: false,
    });
    expect(todo?.id).toEqual(expect.any(String));
  });

  it('preserves explicitly provided id and status', () => {
    addTodo({ id: 'todo-1', title: 'Готовая задача', isComplete: true });

    expect(useTodoList.getState().todoList).toEqual([{ id: 'todo-1', title: 'Готовая задача', isComplete: true }]);
  });
});
