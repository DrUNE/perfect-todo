import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins class names with a space', () => {
    expect(cx('a', 'b')).toBe('a b');
  });

  it('skips false, null, undefined and empty values', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('adds a conditional class only when the condition is true', () => {
    const isOn = (value: boolean) => value;

    expect(cx('a', isOn(true) && 'b')).toBe('a b');
    expect(cx('a', isOn(false) && 'b')).toBe('a');
  });

  it('returns an empty string without classes', () => {
    expect(cx()).toBe('');
  });
});
