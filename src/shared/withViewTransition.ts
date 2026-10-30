import './withViewTransition.css';
import { flushSync } from 'react-dom';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Выполняет обновление состояния внутри View Transition: браузер анимирует элементы с
 * `view-transition-name` (появление, исчезновение, сдвиг). Без поддержки API или при
 * `prefers-reduced-motion` обновление применяется сразу и без анимации.
 *
 * `onApplied` вызывается, когда обновление уже отражено в DOM (например, чтобы вернуть фокус).
 */
export const withViewTransition = (update: () => void, onApplied?: () => void) => {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    onApplied?.();
    return;
  }

  document.startViewTransition(() => {
    flushSync(update);
    onApplied?.();
  });
};
