import { beforeEach, describe, expect, it } from 'vitest';
import {
  addTodo,
  clearCompletedTodos,
  deleteTodo,
  editTodo,
  toggleTodo,
  undoDelete,
  useTodoList,
  type Todo,
} from './todoStore';

const initialTodoList: Todo[] = [
  { id: 'todo-1', title: 'Первая задача', isComplete: false },
  { id: 'todo-2', title: 'Вторая задача', isComplete: true },
];

describe('todoStore', () => {
  beforeEach(() => {
    useTodoList.setState({ todoList: initialTodoList, deletedTodos: [] });
  });

  describe('addTodo', () => {
    it('adds an incomplete todo with generated id and trimmed title to the top of the list', () => {
      addTodo('  Новая задача  ');

      const todoList = useTodoList.getState().todoList;

      expect(todoList).toHaveLength(3);
      expect(todoList.slice(1)).toEqual(initialTodoList);
      expect(todoList[0]).toEqual({
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
      expect(clearCompletedTodos()).toBe(1);
      expect(useTodoList.getState().todoList).toEqual([
        { id: 'todo-1', title: 'Первая задача', isComplete: false },
      ]);
    });
  });

  describe('undoDelete', () => {
    it('returns a deleted todo to its previous position', () => {
      deleteTodo('todo-1');

      expect(undoDelete()).toBe(1);
      expect(useTodoList.getState().todoList).toEqual(initialTodoList);
      expect(useTodoList.getState().deletedTodos).toEqual([]);
    });

    it('returns all todos removed by clearing completed ones in their original order', () => {
      useTodoList.setState({
        todoList: [
          { id: 'a', title: 'A', isComplete: true },
          { id: 'b', title: 'B', isComplete: false },
          { id: 'c', title: 'C', isComplete: true },
          { id: 'd', title: 'D', isComplete: false },
        ],
      });

      expect(clearCompletedTodos()).toBe(2);
      expect(useTodoList.getState().todoList.map((todo) => todo.id)).toEqual(['b', 'd']);
      expect(undoDelete()).toBe(2);
      expect(useTodoList.getState().todoList.map((todo) => todo.id)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('puts the todo back after its previous neighbour even if new todos were added on top', () => {
      deleteTodo('todo-2');
      addTodo('Новая');
      undoDelete();

      expect(useTodoList.getState().todoList.map((todo) => todo.title)).toEqual([
        'Новая',
        'Первая задача',
        'Вторая задача',
      ]);
    });

    it('does nothing when there is nothing to undo', () => {
      expect(undoDelete()).toBe(0);
      expect(useTodoList.getState().todoList).toEqual(initialTodoList);
    });
  });
});
