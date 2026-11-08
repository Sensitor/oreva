import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Device-only state for the Phase 2 prototype: follows, prototype settings,
 * messages typed in demo Circles, workout progress. Nothing leaves the phone.
 * From Phase 3, the account-related parts move to the member's profile.
 */
export type MapProvider = 'mapbox' | 'apple';

export interface PrototypeState {
  mapProvider: MapProvider;
  mapStressTest: boolean;
  mapTelemetryEnabled: boolean;
  followedOrganizations: string[];
  followedInstructors: string[];
  notifications: {
    classReminders: boolean;
    classUpdates: boolean;
    circleMessages: boolean;
    news: boolean;
  };
  /** Messages the member typed in demo Circles, by circle id. */
  localMessages: Record<string, { id: string; body: string; sentAt: string }[]>;
  /** Last position in seconds, by workout id ("resume where you stopped"). */
  workoutProgress: Record<string, number>;
  completedWorkouts: { workoutId: string; completedAt: string }[];
  /** Circles created in the prototype, stored on this phone only. */
  createdCircles: { id: string; name: string; createdAt: string }[];
}

export const DEFAULT_PROTOTYPE_STATE: PrototypeState = {
  mapProvider: 'mapbox',
  mapStressTest: false,
  mapTelemetryEnabled: true,
  followedOrganizations: ['org-atelier-rivage', 'org-linden-london'],
  followedInstructors: ['ins-lea', 'ins-claire'],
  // Non-essential notifications are off by default (cahier des charges 1.4: consent).
  notifications: { classReminders: true, classUpdates: true, circleMessages: true, news: false },
  localMessages: {},
  workoutProgress: {},
  completedWorkouts: [],
  createdCircles: [],
};

const STORAGE_KEY = 'oreva.prototype.v1';

interface StoreValue {
  state: PrototypeState;
  update: (patch: (previous: PrototypeState) => PrototypeState) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function PrototypeStoreProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: PrototypeState;
}) {
  const [state, setState] = useState<PrototypeState>(initialState ?? DEFAULT_PROTOTYPE_STATE);

  useEffect(() => {
    if (initialState) {
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setState({ ...DEFAULT_PROTOTYPE_STATE, ...(JSON.parse(raw) as Partial<PrototypeState>) });
        }
      })
      .catch(() => undefined);
  }, [initialState]);

  const update = useCallback((patch: (previous: PrototypeState) => PrototypeState) => {
    setState((previous) => {
      const next = patch(previous);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_PROTOTYPE_STATE);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePrototypeStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error('usePrototypeStore must be used inside PrototypeStoreProvider');
  }
  return value;
}

export function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
