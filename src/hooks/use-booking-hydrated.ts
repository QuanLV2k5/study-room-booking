import { useSyncExternalStore } from 'react';
import { useBookingStore } from '@/store/useBookingStore';

const subscribe = (notify: () => void) => {
  const start = useBookingStore.persist.onHydrate(notify);
  const finish = useBookingStore.persist.onFinishHydration(notify);
  return () => { start(); finish(); };
};

export function useBookingHydrated() {
  return useSyncExternalStore(subscribe, useBookingStore.persist.hasHydrated, () => false);
}
