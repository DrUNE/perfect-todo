import { create } from 'zustand';

export type Todo = {
  id: string;
  title: string;
  isComplete: boolean;
};

type TodoState = {
  todoList: Todo[];
};

export const useTodoList = create<TodoState>(() => ({ todoList: [] }));

const setTodoList = (update: (todoList: Todo[]) => Todo[]) => {
  useTodoList.setState(({ todoList }) => ({ todoList: update(todoList) }));
};

export const addTodo = (title: Todo['title']) => {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return;
  }

  setTodoList((todoList) => [
    ...todoList,
    { id: crypto.randomUUID(), title: normalizedTitle, isComplete: false },
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

export const clearCompletedTodos = () => {
  setTodoList((todoList) => todoList.filter((todo) => !todo.isComplete));
};
