import { throttle } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef } from "react";
export function usePreservedCallback<Callback extends (...args: any[]) => any>(
  callback: Callback
) {
  const callbackRef = useRef<Callback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as Callback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  wait: number
) {
  const preservedCallback = usePreservedCallback(callback);
  const throttleCallback = useMemo(() => {
    return throttle(preservedCallback, wait);
  }, [preservedCallback, wait]);

  useEffect(() => {
    return () => {
      throttleCallback.cancel();
    };
  }, [throttleCallback]);

  return throttleCallback;
}
