import styles from '@/App.module.css';
import { addTen, decrement, increment, reset, useCounter } from '@/model/counterStore';

function App() {
  const counter = useCounter((state) => state.counter);

  return (
    <div className={styles.wrapper}>
      <button onClick={increment}>+</button>
      <span>{counter}</span>
      <button onClick={decrement}>-</button>
      <button onClick={addTen}>increase on 10</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
