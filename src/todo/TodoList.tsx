import { AdwPreferencesGroup } from '@gtk-js/adwaita';
import { useEffect, useEffectEvent, useRef, useState, type FocusEvent } from 'react';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import styles from './TodoList.module.css';
import { TodoItem } from './TodoItem';
import { TodoItemEditor } from './TodoItemEditor';
import { editTodo, toggleTodo, useTodoList, type Todo } from './todoStore';

type TodoListProps = {
  onDelete: (id: Todo['id']) => void;
  /** Стрелка вверх на первой строке: вернуться в строку новой задачи. */
  onNavigateUp: () => void;
  announce: (message: string) => void;
};

const findRow = (container: HTMLElement | null, id: Todo['id']) =>
  container?.querySelector<HTMLElement>(`[data-todo-id="${CSS.escape(id)}"]`);

// Список задач. В Tab-порядок входит одна строка (roving tabindex), по списку двигаются стрелками.
// Клавиши на строке: Пробел отмечает, Enter или F2 редактирует, Delete или Backspace удаляет.
export function TodoList({ onDelete, onNavigateUp, announce }: TodoListProps) {
  const todoList = useTodoList((state) => state.todoList);
  const { hasMouse } = useDeviceInfo();
  const [editingId, setEditingId] = useState<Todo['id'] | null>(null);
  const [activeId, setActiveId] = useState<Todo['id'] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocusId = useRef<Todo['id'] | null>(null);

  // Фокус на строку после того, как редактор заменился строкой, можно поставить только после рендера.
  // Без прокрутки: новая строка какое-то время стоит в конце списка (AdwPreferencesGroup ставит её на место
  // позже), и обычный focus() прокрутил бы страницу вниз. Редактируемая строка и так была на экране.
  useEffect(() => {
    if (pendingFocusId.current) {
      findRow(containerRef.current, pendingFocusId.current)?.focus({ preventScroll: true });
      pendingFocusId.current = null;
    }
  });

  const tabStopId = todoList.some((todo) => todo.id === activeId) ? activeId : todoList[0]?.id;

  const focusAt = (index: number) => {
    const todo = todoList[index];

    if (todo) {
      findRow(containerRef.current, todo.id)?.focus();
    }
  };

  const toggle = (id: Todo['id']) => {
    const todo = todoList.find((item) => item.id === id);

    toggleTodo(id);

    if (todo) {
      announce(
        todo.isComplete
          ? `Задача «${todo.title}» снова не выполнена`
          : `Задача «${todo.title}» выполнена`,
      );
    }
  };

  // Перед удалением фокус переходит на соседнюю задачу, а если её нет — в строку новой задачи.
  const remove = (id: Todo['id']) => {
    const index = todoList.findIndex((todo) => todo.id === id);
    const neighbour = todoList[index + 1] ?? todoList[index - 1];

    if (neighbour) {
      findRow(containerRef.current, neighbour.id)?.focus();
    } else {
      onNavigateUp();
    }

    onDelete(id);
  };

  const finishEditing = (id: Todo['id'], restoreFocus: boolean) => {
    pendingFocusId.current = restoreFocus ? id : null;
    setEditingId(null);
  };

  const handleSave = (id: Todo['id'], title: string, restoreFocus: boolean) => {
    editTodo(id, title);
    announce('Задача изменена');
    finishEditing(id, restoreFocus);
  };

  // Клавиши на строке. Слушатель нативный и на этапе capture: AdwPreferencesGroup сам двигает фокус
  // стрелками и на краях списка уводит его дальше, как Tab, а нам нужно предсказуемое поведение.
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const row =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>('[data-todo-id]')
        : null;
    const id = row?.dataset.todoId;

    // Обрабатываем только клавиши на самой строке: внутри поля редактирования они нужны полю.
    if (!row || !id || event.target !== row || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const index = todoList.findIndex((todo) => todo.id === id);

    switch (event.key) {
      case 'ArrowDown':
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        if (index === 0) {
          onNavigateUp();
        } else {
          focusAt(index - 1);
        }
        break;
      case 'Home':
        focusAt(0);
        break;
      case 'End':
        focusAt(todoList.length - 1);
        break;
      case ' ':
        toggle(id);
        break;
      case 'Enter':
      case 'F2':
        setEditingId(id);
        break;
      case 'Delete':
      case 'Backspace':
        // Shift+Delete (очистка завершённых) обрабатывается глобально на странице.
        if (event.shiftKey) {
          return;
        }

        remove(id);
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const listener = (event: KeyboardEvent) => handleKeyDown(event);

    container.addEventListener('keydown', listener, true);

    return () => container.removeEventListener('keydown', listener, true);
  }, []);

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const id =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>('[data-todo-id]')?.dataset.todoId
        : undefined;

    if (id) {
      setActiveId(id);
    }
  };

  return (
    <div ref={containerRef} className={styles.container} onFocus={handleFocus}>
      {todoList.length > 0 && (
        <AdwPreferencesGroup className={styles.list}>
          {todoList.map((todo) =>
            todo.id === editingId ? (
              <TodoItemEditor
                key={todo.id}
                todo={todo}
                onSave={(title, restoreFocus) => handleSave(todo.id, title, restoreFocus)}
                onCancel={(restoreFocus) => finishEditing(todo.id, restoreFocus)}
              />
            ) : (
              <TodoItem
                key={todo.id}
                todo={todo}
                isTabStop={todo.id === tabStopId}
                showStatusButton={hasMouse}
                onToggle={toggle}
                onEdit={setEditingId}
                onDelete={remove}
              />
            ),
          )}
        </AdwPreferencesGroup>
      )}
    </div>
  );
}
