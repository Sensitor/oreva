import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { appVariant } from '@/config/env';
import { resolveDataSource } from './dataSource';
import { createDemoRepositories } from './demoRepositories';
import type { OrevaRepositories } from './types';
import { createUnavailableRepositories } from './unavailableRepositories';

const RepositoriesContext = createContext<OrevaRepositories | null>(null);

export function createRepositories(now: Date = new Date()): OrevaRepositories {
  const source = resolveDataSource(appVariant, process.env.EXPO_PUBLIC_DATA_SOURCE);
  return source === 'demo' ? createDemoRepositories(now) : createUnavailableRepositories();
}

interface DataProviderProps {
  children: ReactNode;
  /** Injected in tests. */
  repositories?: OrevaRepositories;
  /** Injected in tests (no background timers). */
  queryClient?: QueryClient;
}

export function DataProvider({
  children,
  repositories,
  queryClient: injectedClient,
}: DataProviderProps) {
  const [value] = useState(() => repositories ?? createRepositories());
  const [queryClient] = useState(
    () =>
      injectedClient ??
      new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoriesContext.Provider value={value}>{children}</RepositoriesContext.Provider>
    </QueryClientProvider>
  );
}

export function useRepositories(): OrevaRepositories {
  const value = useContext(RepositoriesContext);
  if (!value) {
    throw new Error('useRepositories must be used inside DataProvider');
  }
  return value;
}
