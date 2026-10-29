import { setTodoList, type Todo } from '@/entities/todo/model';

export const toggleTodo = (id: Todo['id']) => {
  setTodoList(({ todoList }) => ({
    todoList: todoList.map((todo) =>
      todo.id === id ? { ...todo, isComplete: !todo.isComplete } : todo,
    ),
  }));
};
