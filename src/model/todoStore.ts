import { create } from 'zustand';

type WithOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };
type WithOptionalMultiple<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};

export type Todo = {
  id: string;
  title: string;
  isComplete: boolean;
};

const initialState = {
  todoList: [] as Todo[],
};

export const useTodoList = create(() => ({ ...initialState }));
export const setTodoList = useTodoList.setState;

export const addTodo = (
  todo: WithOptionalMultiple<Todo, 'id' | 'isComplete'>,
) => {
  setTodoList(({ todoList }) => ({
    todoList: [
      ...todoList,
      {
        id: todo.id ?? crypto.randomUUID(),
        title: todo.title,
        isComplete: todo.isComplete ?? false,
      },
    ],
  }));
};
