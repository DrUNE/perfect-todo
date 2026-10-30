import { GtkButton } from '@gtk-js/adwaita';
import { withViewTransition } from '@/shared/withViewTransition';
import { clearCompletedTodos } from './todoStore';

export function ClearCompletedButton() {
  return (
    <GtkButton
      className="circular"
      iconName="EditClearAll"
      aria-label="Удалить завершённые"
      tooltipText="Удалить завершённые"
      onClicked={() => withViewTransition(clearCompletedTodos)}
    />
  );
}
