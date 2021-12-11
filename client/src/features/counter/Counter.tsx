import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { decrement, increment, incrementByAmount } from "./counter-slice";

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
        <button
          aria-label="Add 10 to value"
          onClick={() => dispatch(incrementByAmount(10))}
        >
          Add 10
        </button>
      </div>
    </div>
  );
}
