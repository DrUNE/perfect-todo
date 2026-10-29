import { setTodoList, type Todo } from '@/entities/todo/model';

export const editTodo = (id: Todo['id'], title: Todo['title']) => {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return false;
  }

  setTodoList(({ todoList }) => ({
    todoList: todoList.map((todo) => (todo.id === id ? { ...todo, title: normalizedTitle } : todo)),
  }));

  return true;
};
