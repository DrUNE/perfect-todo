import { GtkBox, GtkButton } from '@gtk-js/adwaita';
import { useDeviceInfo } from '@/shared/useDeviceInfo';
import { ClearCompletedButton } from './ClearCompletedButton';
import { useTodoList } from './todoStore';

type TodoToolbarProps = {
  /** В поле ввода есть текст или идёт редактирование задачи. */
  isInputActive: boolean;
  canConfirm: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Высота круглой иконки-кнопки Adwaita (34px): место под панель резервируется всегда,
// чтобы появление и исчезновение кнопок не сдвигало поле ввода и список.
const toolbarHeight = 34;

// Панель иконок-действий над полем ввода: слева действия над списком, справа подтверждение и отмена
// ввода на устройствах с тач-экраном (там нет Esc).
export function TodoToolbar({ isInputActive, canConfirm, onConfirm, onCancel }: TodoToolbarProps) {
  const hasCompletedTodos = useTodoList((state) => state.todoList.some((todo) => todo.isComplete));
  const { hasTouch } = useDeviceInfo();
  const showInputActions = hasTouch && isInputActive;

  return (
    <GtkBox spacing={8} style={{ height: toolbarHeight, marginBottom: 8 }}>
      {hasCompletedTodos && <ClearCompletedButton />}
      {showInputActions && (
        <GtkBox spacing={8} style={{ marginLeft: 'auto' }}>
          <GtkButton
            className="circular"
            iconName="WindowClose"
            aria-label="Отмена"
            tooltipText="Отмена"
            onClicked={onCancel}
          />
          <GtkButton
            className="circular suggested-action"
            iconName="ObjectSelect"
            aria-label="Подтвердить"
            tooltipText="Подтвердить"
            disabled={!canConfirm}
            onClicked={onConfirm}
          />
        </GtkBox>
      )}
    </GtkBox>
  );
}
