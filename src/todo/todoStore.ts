import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Todo = {
  id: string;
  title: string;
  isComplete: boolean;
};

/**
 * Удалённая задача и её место в списке: нужны, чтобы вернуть её на место. Основа — предыдущая задача
 * (позиции сдвигаются, когда в начало добавляют новые), запасной вариант — прежний индекс.
 */
export type DeletedTodo = {
  todo: Todo;
  index: number;
  previousId: Todo['id'] | null;
};

type TodoState = {
  todoList: Todo[];
  /** Задачи, удалённые последним действием (удаление или очистка завершённых), для отмены. */
  deletedTodos: DeletedTodo[];
};

type PersistedTodoState = Pick<TodoState, 'todoList'>;

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
  persist<TodoState, [], [], PersistedTodoState>(() => ({ todoList: [], deletedTodos: [] }), {
    name: 'todo-list',
    // Сохраняем только задачи: список для отмены удаления живёт до перезагрузки страницы.
    partialize: ({ todoList }) => ({ todoList }),
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
  const { todoList } = useTodoList.getState();
  const index = todoList.findIndex((todo) => todo.id === id);
  const todo = todoList[index];

  if (!todo) {
    return;
  }

  useTodoList.setState({
    todoList: todoList.filter((item) => item.id !== id),
    deletedTodos: [{ todo, index, previousId: todoList[index - 1]?.id ?? null }],
  });
};

/** Удаляет завершённые задачи и возвращает их количество. */
export const clearCompletedTodos = () => {
  const { todoList } = useTodoList.getState();
  const deletedTodos = todoList.flatMap((todo, index) =>
    todo.isComplete ? [{ todo, index, previousId: todoList[index - 1]?.id ?? null }] : [],
  );

  if (deletedTodos.length === 0) {
    return 0;
  }

  useTodoList.setState({
    todoList: todoList.filter((todo) => !todo.isComplete),
    deletedTodos,
  });

  return deletedTodos.length;
};

/** Возвращает на прежние места задачи, удалённые последним действием, и их количество. */
export const undoDelete = () => {
  const { todoList, deletedTodos } = useTodoList.getState();

  if (deletedTodos.length === 0) {
    return 0;
  }

  // Вставляем по возрастанию исходных позиций: предыдущая задача уже на месте, порядок как до удаления.
  const restored = [...todoList];

  for (const { todo, index, previousId } of [...deletedTodos].sort((a, b) => a.index - b.index)) {
    const previousIndex =
      previousId === null ? -1 : restored.findIndex((item) => item.id === previousId);
    const position = previousId !== null && previousIndex !== -1 ? previousIndex + 1 : index;

    restored.splice(Math.min(position, restored.length), 0, todo);
  }

  useTodoList.setState({ todoList: restored, deletedTodos: [] });

  return deletedTodos.length;
};
