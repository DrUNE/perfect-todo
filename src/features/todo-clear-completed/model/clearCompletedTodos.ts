import { setTodoList } from '@/entities/todo/model';

export const clearCompletedTodos = () => {
  setTodoList(({ todoList }) => ({
    todoList: todoList.filter((todo) => !todo.isComplete),
  }));
};
