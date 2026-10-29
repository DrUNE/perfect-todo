import { create } from 'zustand';

const initialState = {
  counter: 0,
};

export const useCounter = create(() => ({ ...initialState }));

export const setCounterState = useCounter.setState;

export const increment = () => setCounterState(({ counter }) => ({ counter: counter + 1 }));
export const decrement = () => setCounterState(({ counter }) => ({ counter: counter - 1 }));
export const reset = () => setCounterState(initialState);
export const addTen = () =>
  setCounterState(({ counter }) => {
    if (counter >= 0) {
      counter += 10;
    } else {
      counter -= 10;
    }
    return { counter };
  });
