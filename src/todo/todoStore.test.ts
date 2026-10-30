import { beforeEach, describe, expect, it } from 'vitest';
import {
  addTodo,
  clearCompletedTodos,
  deleteTodo,
  editTodo,
  toggleTodo,
  useTodoList,
  type Todo,
} from './todoStore';

const initialTodoList: Todo[] = [
  { id: 'todo-1', title: 'Первая задача', isComplete: false },
  { id: 'todo-2', title: 'Вторая задача', isComplete: true },
];

describe('todoStore', () => {
  beforeEach(() => {
    useTodoList.setState({ todoList: initialTodoList });
  });

  describe('addTodo', () => {
    it('adds an incomplete todo with generated id and trimmed title', () => {
      addTodo('  Новая задача  ');

      const todoList = useTodoList.getState().todoList;

      expect(todoList).toHaveLength(3);
      expect(todoList[2]).toEqual({
        id: expect.any(String),
        title: 'Новая задача',
        isComplete: false,
      });
    });

    it('does not add an empty todo', () => {
      addTodo('   ');

      expect(useTodoList.getState().todoList).toEqual(initialTodoList);
    });
  });

  describe('toggleTodo', () => {
    it('toggles only the selected todo', () => {
      toggleTodo('todo-1');

      expect(useTodoList.getState().todoList).toEqual([
        { id: 'todo-1', title: 'Первая задача', isComplete: true },
        { id: 'todo-2', title: 'Вторая задача', isComplete: true },
      ]);
    });
  });

  describe('editTodo', () => {
    it('updates only the selected todo and trims its title', () => {
      expect(editTodo('todo-1', '  Обновлённая задача  ')).toBe(true);
      expect(useTodoList.getState().todoList).toEqual([
        { id: 'todo-1', title: 'Обновлённая задача', isComplete: false },
        { id: 'todo-2', title: 'Вторая задача', isComplete: true },
      ]);
    });

    it('does not save an empty title', () => {
      expect(editTodo('todo-1', '   ')).toBe(false);
      expect(useTodoList.getState().todoList).toEqual(initialTodoList);
    });
  });

  describe('deleteTodo', () => {
    it('removes only the selected todo', () => {
      deleteTodo('todo-2');

      expect(useTodoList.getState().todoList).toEqual([
        { id: 'todo-1', title: 'Первая задача', isComplete: false },
      ]);
    });

    it('does nothing for an unknown id', () => {
      deleteTodo('unknown');

      expect(useTodoList.getState().todoList).toEqual(initialTodoList);
    });
  });

  describe('clearCompletedTodos', () => {
    it('removes completed todos and keeps active todos', () => {
      clearCompletedTodos();

      expect(useTodoList.getState().todoList).toEqual([
        { id: 'todo-1', title: 'Первая задача', isComplete: false },
      ]);
    });
  });
});
