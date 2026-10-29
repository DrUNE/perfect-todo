import { create } from 'zustand';

export type Todo = {
  id: string;
  title: string;
  isComplete: boolean;
};

export type NewTodo = Omit<Todo, 'id' | 'isComplete'> & Partial<Pick<Todo, 'id' | 'isComplete'>>;

type TodoState = {
  todoList: Todo[];
};

const initialState: TodoState = {
  todoList: [],
};

export const useTodoList = create<TodoState>(() => ({ ...initialState }));
export const setTodoList = useTodoList.setState;

export const addTodo = (todo: NewTodo) => {
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
