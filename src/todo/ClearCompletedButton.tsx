import { GtkButton } from '@gtk-js/adwaita';

type ClearCompletedButtonProps = {
  onClick: () => void;
};

export function ClearCompletedButton({ onClick }: ClearCompletedButtonProps) {
  return (
    <GtkButton
      className="circular"
      iconName="EditClearAll"
      aria-label="Удалить завершённые"
      tooltipText="Удалить завершённые (Shift+Delete)"
      onClicked={onClick}
    />
  );
}
