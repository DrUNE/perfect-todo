import { AdwActionRow, AdwDialog, AdwPreferencesGroup, GtkButton, GtkLabel } from '@gtk-js/adwaita';
import { useEffect, useEffectEvent, useState } from 'react';

type Shortcut = { action: string; keys: string };

const groups: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: 'Новая задача',
    shortcuts: [
      { action: 'Добавить задачу', keys: 'Enter' },
      { action: 'Очистить поле', keys: 'Esc' },
      { action: 'Перейти к списку', keys: '↓' },
    ],
  },
  {
    title: 'Список задач',
    shortcuts: [
      { action: 'Перейти между задачами', keys: '↑ ↓ Home End' },
      { action: 'Отметить как выполненную', keys: 'Пробел' },
      { action: 'Редактировать на месте', keys: 'Enter или F2' },
      { action: 'Удалить задачу', keys: 'Delete или Backspace' },
    ],
  },
  {
    title: 'Редактирование задачи',
    shortcuts: [
      { action: 'Сохранить', keys: 'Enter' },
      { action: 'Отменить', keys: 'Esc' },
    ],
  },
  {
    title: 'Везде',
    shortcuts: [
      { action: 'Удалить завершённые', keys: 'Shift+Delete' },
      { action: 'Отменить удаление', keys: 'Ctrl+Z' },
      { action: 'Показать эту справку', keys: '?' },
    ],
  },
];

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// Кнопка в шапке и диалог со списком горячих клавиш. Диалог открывается также клавишей «?».
export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDocumentKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === '?' && !event.ctrlKey && !event.altKey && !isEditableTarget(event.target)) {
      event.preventDefault();
      setIsOpen(true);
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleDocumentKeyDown(event);

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, []);

  return (
    <>
      <GtkButton
        className="circular"
        iconName="InputKeyboard"
        aria-label="Горячие клавиши"
        tooltipText="Горячие клавиши (?)"
        onClicked={() => setIsOpen(true)}
      />
      <AdwDialog
        title="Горячие клавиши"
        visible={isOpen}
        contentWidth={460}
        onClosed={() => setIsOpen(false)}
        child={
          <div style={{ display: 'grid', gap: 16, padding: 16 }}>
            {groups.map((group) => (
              <AdwPreferencesGroup key={group.title} title={group.title}>
                {group.shortcuts.map((shortcut) => (
                  <AdwActionRow
                    key={shortcut.action}
                    title={shortcut.action}
                    suffixWidget={<GtkLabel label={shortcut.keys} valign="center" />}
                  />
                ))}
              </AdwPreferencesGroup>
            ))}
          </div>
        }
      />
    </>
  );
}
