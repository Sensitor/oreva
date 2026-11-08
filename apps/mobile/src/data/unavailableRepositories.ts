import type { OrevaRepositories } from './types';

/**
 * What production builds get until each backend slice exists (Phases 4+): no
 * data at all, so screens show their empty states. Never the demo data.
 */
export function createUnavailableRepositories(): OrevaRepositories {
  return {
    source: 'unavailable',
    discover: {
      cities: async () => [],
      mapPoints: async () => [],
      classes: async () => [],
      organization: async () => null,
      instructor: async () => null,
      classDetail: async () => null,
    },
    practice: {
      workouts: async () => [],
      workout: async () => null,
      programs: async () => [],
      program: async () => null,
    },
    connect: {
      circles: async () => [],
      circle: async () => null,
      suggestedFollowing: async () => ({ organizations: [], instructors: [] }),
    },
  };
}
