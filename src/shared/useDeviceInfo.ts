import { useMediaQuery } from './useMediaQuery';

export type DeviceInfo = {
  /** Основное устройство ввода — палец (телефон, планшет, раскладной смартфон в любом положении). Не зависит от ширины. */
  isMobile: boolean;
  /** Узкое окно (до 600px): телефон в сложенном виде или узкое окно на десктопе. */
  isCompact: boolean;
  /** Есть хотя бы одно «грубое» указывающее устройство (палец), в том числе в гибридах с мышью. */
  hasTouch: boolean;
  /** Есть точное указывающее устройство с hover (мышь, тачпад): иначе управление только касаниями. */
  hasMouse: boolean;
  /** Окно разделено сгибом на два экрана (раскладной смартфон в режиме двух экранов). */
  isFoldSpanned: boolean;
};

export const useDeviceInfo = (): DeviceInfo => ({
  isMobile: useMediaQuery('(pointer: coarse)'),
  isCompact: useMediaQuery('(max-width: 600px)'),
  hasTouch: useMediaQuery('(any-pointer: coarse)'),
  hasMouse: useMediaQuery('(any-pointer: fine) and (any-hover: hover)'),
  isFoldSpanned: useMediaQuery(
    '(horizontal-viewport-segments: 2), (vertical-viewport-segments: 2)',
  ),
});
