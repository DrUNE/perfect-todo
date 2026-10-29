import { setTodoList, useTodoList } from '@/entities/todo/model';
import { beforeEach, describe, expect, it } from 'vitest';
import { addTodo } from './addTodo';

describe('addTodo', () => {
  beforeEach(() => {
    setTodoList({ todoList: [] });
  });

  it('trims the title before adding a todo', () => {
    addTodo('  Новая задача  ');

    expect(useTodoList.getState().todoList).toHaveLength(1);
    expect(useTodoList.getState().todoList[0]?.title).toBe('Новая задача');
  });

  it('does not add an empty todo', () => {
    addTodo('   ');

    expect(useTodoList.getState().todoList).toEqual([]);
  });
});
