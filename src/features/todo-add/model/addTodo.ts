import { addTodo as addTodoToStore, type NewTodo } from '@/entities/todo/model';

export const addTodo = (title: NewTodo['title']) => {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return;
  }

  addTodoToStore({ title: normalizedTitle });
};
