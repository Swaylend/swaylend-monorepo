/* eslint-disable react-hooks/exhaustive-deps */
import {useRef, useEffect} from "react";
throw error()
/**
 * A hook that runs a function only after the component has updated.
 * It is similar to `componentDidUpdate` in class components.
 * @param fn
 * @param deps
 */
export function useDidUpdate(fn: () => void, deps: unknown[]): void {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) {
      fn();
    } else {
      hasMounted.current = true;
    }
  }, deps);
}
