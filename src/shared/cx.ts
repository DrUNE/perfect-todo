type ClassValue = string | false | null | undefined;

/** Объединяет имена классов через пробел, отбрасывая пустые и ложные значения: `cx('a', cond && 'b')`. */
export const cx = (...classNames: ClassValue[]) => classNames.filter(Boolean).join(' ');
