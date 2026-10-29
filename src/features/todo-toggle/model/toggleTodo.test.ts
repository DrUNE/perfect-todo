import { setTodoList, useTodoList } from '@/entities/todo/model';
import { beforeEach, describe, expect, it } from 'vitest';
import { toggleTodo } from './toggleTodo';

describe('toggleTodo', () => {
  beforeEach(() => {
    setTodoList({
      todoList: [
        { id: 'todo-1', title: 'Первая задача', isComplete: false },
        { id: 'todo-2', title: 'Вторая задача', isComplete: true },
      ],
    });
  });

  it('toggles only the selected todo', () => {
    toggleTodo('todo-1');

    expect(useTodoList.getState().todoList).toEqual([
      { id: 'todo-1', title: 'Первая задача', isComplete: true },
      { id: 'todo-2', title: 'Вторая задача', isComplete: true },
    ]);
  });
});
