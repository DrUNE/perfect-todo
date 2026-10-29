import { setTodoList, useTodoList } from '@/entities/todo/model';
import { beforeEach, describe, expect, it } from 'vitest';
import { editTodo } from './editTodo';

describe('editTodo', () => {
  beforeEach(() => {
    setTodoList({
      todoList: [
        { id: 'todo-1', title: 'Первая задача', isComplete: false },
        { id: 'todo-2', title: 'Вторая задача', isComplete: true },
      ],
    });
  });

  it('updates only the selected todo and trims its title', () => {
    expect(editTodo('todo-1', '  Обновлённая задача  ')).toBe(true);
    expect(useTodoList.getState().todoList).toEqual([
      { id: 'todo-1', title: 'Обновлённая задача', isComplete: false },
      { id: 'todo-2', title: 'Вторая задача', isComplete: true },
    ]);
  });

  it('does not save an empty title', () => {
    expect(editTodo('todo-1', '   ')).toBe(false);
    expect(useTodoList.getState().todoList[0]?.title).toBe('Первая задача');
  });
});
