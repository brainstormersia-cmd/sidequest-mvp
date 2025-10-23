import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReduceMotion = () => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (isMounted) {
          setReduceMotionEnabled(value);
        }
      })
      .catch(() => undefined);

    const handler = (value: boolean) => {
      if (isMounted) {
        setReduceMotionEnabled(value);
      }
    };

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', handler);

    return () => {
      isMounted = false;
      if (typeof subscription?.remove === 'function') {
        subscription.remove();
      } else if (typeof (AccessibilityInfo as any).removeEventListener === 'function') {
        (AccessibilityInfo as any).removeEventListener('reduceMotionChanged', handler);
      }
    };
  }, []);

  return reduceMotionEnabled;
};
