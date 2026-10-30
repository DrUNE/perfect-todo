import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';

type UseHorizontalSwipeOptions = {
  /** Смещение по горизонтали, после которого жест засчитывается. */
  threshold?: number;
  onSwipe: () => void;
};

// Сколько пикселей можно сдвинуть палец, прежде чем решить, горизонтальный это жест или вертикальная прокрутка.
const SLOP = 10;
const MAX_OFFSET = 120;

/**
 * Горизонтальный свайп по элементу пальцем или пером (мышью жест не срабатывает).
 * Элемент смещается за пальцем; после порога жест вызывает `onSwipe`, иначе элемент возвращается на место.
 * Нужен `touch-action: pan-y` у элемента, чтобы вертикальная прокрутка страницы продолжала работать.
 */
export const useHorizontalSwipe = ({ threshold = 72, onSwipe }: UseHorizontalSwipeOptions) => {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const gesture = useRef<{ pointerId: number; x: number; y: number; isSwiping: boolean } | null>(
    null,
  );

  // Нажатие, сдвинутое дальше SLOP (свайп пальцем, протяжка мышью), заканчивается click на элементе: его нужно
  // погасить, иначе элемент отреагирует как на обычный клик.
  const pressedAt = useRef<{ x: number; y: number } | null>(null);

  const reset = () => {
    gesture.current = null;
    setIsSwiping(false);
    setOffset(0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.isPrimary) {
      pressedAt.current = { x: event.clientX, y: event.clientY };
    }

    if (event.pointerType === 'mouse' || !event.isPrimary) {
      return;
    }

    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      isSwiping: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;

    if (!current || current.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;

    if (!current.isSwiping) {
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
        // Вертикальное движение: это прокрутка, жест не наш.
        gesture.current = null;
        return;
      }

      if (Math.abs(dx) <= SLOP) {
        return;
      }

      // Захват указателя только после начала жеста: иначе нажатие на кнопку внутри строки перестало бы
      // доходить до самой кнопки.
      event.currentTarget.setPointerCapture(event.pointerId);
      current.isSwiping = true;
      setIsSwiping(true);
    }

    setOffset(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx)));
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;

    if (!current || current.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - current.x;
    const wasSwiping = current.isSwiping;

    reset();

    if (wasSwiping && Math.abs(dx) >= threshold) {
      onSwipe();
    }
  };

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    const pressed = pressedAt.current;

    if (pressed && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > SLOP) {
      event.stopPropagation();
    }
  };

  const style: CSSProperties & Record<'--swipe-progress', number> = {
    '--swipe-progress': Math.min(Math.abs(offset) / threshold, 1),
    transform: offset === 0 ? undefined : `translateX(${offset}px)`,
    transition: isSwiping ? 'none' : 'transform 150ms ease',
  };

  return {
    swipeProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: reset,
      onClickCapture: handleClickCapture,
    },
    swipeStyle: style,
  };
};
