import { AdwClamp, AdwToastOverlay, type AdwToastOverlayRef } from '@gtk-js/adwaita';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { withViewTransition } from '@/shared/withViewTransition';
import { NewTodoRow } from './NewTodoRow';
import styles from './TodoPage.module.css';
import { ShortcutHints } from './ShortcutHints';
import { TodoList } from './TodoList';
import { TodoToolbar } from './TodoToolbar';
import { clearCompletedTodos, deleteTodo, undoDelete, useTodoList, type Todo } from './todoStore';

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

type Announcement = { id: number; message: string };

export function TodoPage() {
  const toastRef = useRef<AdwToastOverlayRef>(null);
  const newTodoRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState<Announcement>({ id: 0, message: '' });

  // Каждое сообщение — новый элемент, чтобы скринридер озвучил и повторяющийся текст.
  const announce = (message: string) => {
    setAnnouncement((current) => ({ id: current.id + 1, message }));
  };

  const focusNewTodo = () => {
    newTodoRef.current?.querySelector('input')?.focus();
  };

  // Перейти к списку: фокус получает строка, которая является его Tab-остановкой.
  const focusList = () => {
    listRef.current?.querySelector<HTMLElement>('[data-todo-id][tabindex="0"]')?.focus();
  };

  // Если сфокусированный элемент исчез вместе с удалённой строкой, фокус не должен теряться.
  const restoreLostFocus = () => {
    if (document.activeElement && document.activeElement !== document.body) {
      return;
    }

    if (listRef.current?.querySelector<HTMLElement>('[data-todo-id][tabindex="0"]')) {
      focusList();
    } else {
      focusNewTodo();
    }
  };

  const undo = () => {
    if (useTodoList.getState().deletedTodos.length === 0) {
      return;
    }

    withViewTransition(() => undoDelete());
    toastRef.current?.dismissAll();
    announce('Удаление отменено');
  };

  const deleteWithUndo = (id: Todo['id']) => {
    withViewTransition(() => deleteTodo(id));
    toastRef.current?.addToast({
      title: 'Задача удалена',
      buttonLabel: 'Отменить',
      timeout: 6,
      onButtonClicked: undo,
    });
  };

  const clearCompleted = () => {
    const count = useTodoList.getState().todoList.filter((todo) => todo.isComplete).length;

    if (count === 0) {
      return;
    }

    withViewTransition(() => clearCompletedTodos(), restoreLostFocus);
    toastRef.current?.addToast({
      title: `Удалено завершённых задач: ${count}`,
      buttonLabel: 'Отменить',
      timeout: 6,
      onButtonClicked: undo,
    });
  };

  // Сочетания клавиш на уровне страницы. В полях ввода они не срабатывают: там Ctrl+Z отменяет ввод текста.
  const handleDocumentKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.ctrlKey && !event.shiftKey && !event.altKey && event.code === 'KeyZ') {
      event.preventDefault();
      undo();
    } else if (event.shiftKey && !event.ctrlKey && !event.altKey && event.key === 'Delete') {
      event.preventDefault();
      clearCompleted();
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleDocumentKeyDown(event);

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, []);

  return (
    <>
      <AdwClamp maximumSize={400}>
        <div className={styles.content}>
          <div className={styles.stickyBar}>
            <div aria-hidden className={styles.fade} />
            <div className={styles.stickyContent}>
              <TodoToolbar onClearCompleted={clearCompleted} />
              <div ref={newTodoRef} data-new-todo className={styles.input}>
                <NewTodoRow
                  onNavigateDown={focusList}
                  onAdded={() => announce('Задача добавлена')}
                />
              </div>
            </div>
          </div>
          <div ref={listRef}>
            <TodoList onDelete={deleteWithUndo} onNavigateUp={focusNewTodo} announce={announce} />
          </div>
        </div>
      </AdwClamp>
      <AdwToastOverlay
        toastRef={toastRef}
        style={{ position: 'fixed', inset: '0 0 40px', pointerEvents: 'none' }}
      />
      <ShortcutHints />
      <div role="status" aria-live="polite" className={styles.visuallyHidden}>
        <span key={announcement.id}>{announcement.message}</span>
      </div>
    </>
  );
}
