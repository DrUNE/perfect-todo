import { GtkBox, GtkButton } from '@gtk-js/adwaita';

type RowActionsProps = {
  canConfirm: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Кнопки отмены и подтверждения внутри строки ввода или редактирования. Показываются на устройствах
// с тач-экраном, где нет клавиш Enter и Esc.
export function RowActions({ canConfirm, onConfirm, onCancel }: RowActionsProps) {
  return (
    <GtkBox spacing={8} valign="center">
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
  );
}
