import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Todo = {
  id: string;
  title: string;
  isComplete: boolean;
};

type TodoState = {
  todoList: Todo[];
};

const isTodo = (value: unknown): value is Todo =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'string' &&
  'title' in value &&
  typeof value.title === 'string' &&
  'isComplete' in value &&
  typeof value.isComplete === 'boolean';

export const useTodoList = create<TodoState>()(
  persist<TodoState>(() => ({ todoList: [] }), {
    name: 'todo-list',
    // Данные из localStorage — внешняя граница: принимаем только корректные задачи.
    merge: (persistedState, currentState) => {
      const todoList =
        typeof persistedState === 'object' &&
        persistedState !== null &&
        'todoList' in persistedState &&
        Array.isArray(persistedState.todoList)
          ? persistedState.todoList.filter(isTodo)
          : currentState.todoList;

      return { ...currentState, todoList };
    },
  }),
);

const setTodoList = (update: (todoList: Todo[]) => Todo[]) => {
  useTodoList.setState(({ todoList }) => ({ todoList: update(todoList) }));
};

export const addTodo = (title: Todo['title']) => {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return;
  }

  // Новые задачи добавляются в начало списка.
  setTodoList((todoList) => [
    { id: crypto.randomUUID(), title: normalizedTitle, isComplete: false },
    ...todoList,
  ]);
};

export const toggleTodo = (id: Todo['id']) => {
  setTodoList((todoList) =>
    todoList.map((todo) => (todo.id === id ? { ...todo, isComplete: !todo.isComplete } : todo)),
  );
};

export const editTodo = (id: Todo['id'], title: Todo['title']) => {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return false;
  }

  setTodoList((todoList) =>
    todoList.map((todo) => (todo.id === id ? { ...todo, title: normalizedTitle } : todo)),
  );

  return true;
};

export const deleteTodo = (id: Todo['id']) => {
  setTodoList((todoList) => todoList.filter((todo) => todo.id !== id));
};

export const clearCompletedTodos = () => {
  setTodoList((todoList) => todoList.filter((todo) => !todo.isComplete));
};
