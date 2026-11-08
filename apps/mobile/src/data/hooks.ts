import { useQuery } from '@tanstack/react-query';
import { useRepositories } from './DataProvider';
import type { ClassFilters, WorkoutFilters } from './types';

export function useCities() {
  const { discover } = useRepositories();
  return useQuery({ queryKey: ['cities'], queryFn: () => discover.cities() });
}

export function useMapPoints(includeStressTest: boolean) {
  const { discover } = useRepositories();
  return useQuery({
    queryKey: ['map-points', includeStressTest],
    queryFn: () => discover.mapPoints({ includeStressTest }),
  });
}

export function useClasses(filters: ClassFilters) {
  const { discover } = useRepositories();
  // "Now" is read when the query runs, not during render.
  return useQuery({
    queryKey: ['classes', filters],
    queryFn: () => discover.classes(filters, new Date()),
  });
}

export function useOrganizationProfile(id: string) {
  const { discover } = useRepositories();
  return useQuery({ queryKey: ['organization', id], queryFn: () => discover.organization(id) });
}

export function useInstructorProfile(id: string) {
  const { discover } = useRepositories();
  return useQuery({ queryKey: ['instructor', id], queryFn: () => discover.instructor(id) });
}

export function useClassDetail(id: string) {
  const { discover } = useRepositories();
  return useQuery({ queryKey: ['class', id], queryFn: () => discover.classDetail(id) });
}

export function useWorkouts(filters: WorkoutFilters) {
  const { practice } = useRepositories();
  return useQuery({ queryKey: ['workouts', filters], queryFn: () => practice.workouts(filters) });
}

export function useWorkout(id: string) {
  const { practice } = useRepositories();
  return useQuery({ queryKey: ['workout', id], queryFn: () => practice.workout(id) });
}

export function usePrograms() {
  const { practice } = useRepositories();
  return useQuery({ queryKey: ['programs'], queryFn: () => practice.programs() });
}

export function useProgram(id: string) {
  const { practice } = useRepositories();
  return useQuery({ queryKey: ['program', id], queryFn: () => practice.program(id) });
}

export function useCircles() {
  const { connect } = useRepositories();
  return useQuery({ queryKey: ['circles'], queryFn: () => connect.circles() });
}

export function useCircle(id: string) {
  const { connect } = useRepositories();
  return useQuery({ queryKey: ['circle', id], queryFn: () => connect.circle(id) });
}

export function useSuggestedFollowing() {
  const { connect } = useRepositories();
  return useQuery({ queryKey: ['following'], queryFn: () => connect.suggestedFollowing() });
}
