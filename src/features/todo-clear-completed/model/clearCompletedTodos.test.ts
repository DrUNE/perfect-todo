import { setTodoList, useTodoList } from '@/entities/todo/model';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearCompletedTodos } from './clearCompletedTodos';

describe('clearCompletedTodos', () => {
  beforeEach(() => {
    setTodoList({
      todoList: [
        { id: 'todo-1', title: 'Активная задача', isComplete: false },
        { id: 'todo-2', title: 'Завершённая задача', isComplete: true },
      ],
    });
  });

  it('removes completed todos and keeps active todos', () => {
    clearCompletedTodos();

    expect(useTodoList.getState().todoList).toEqual([
      { id: 'todo-1', title: 'Активная задача', isComplete: false },
    ]);
  });
});
