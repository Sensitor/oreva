import type { ClassSession } from '@oreva/core';
import {
  createDemoDataset,
  mapPointsOf,
  stressTestPoints,
  type DemoDataset,
} from '@oreva/demo-data';
import { applyClassFilters } from './filters';
import type { ClassListItem, OrevaRepositories } from './types';

/** Demo implementation of every repository, built on the FICTIONAL dataset (C-2, C-3). */
export function createDemoRepositories(now: Date = new Date()): OrevaRepositories {
  const data: DemoDataset = createDemoDataset(now);

  const toItem = (session: ClassSession): ClassListItem | null => {
    const organization = data.organizations.find((o) => o.id === session.organizationId);
    const instructor = data.instructors.find((i) => i.id === session.instructorId);
    const venue = data.venues.find((v) => v.id === session.venueId);
    const city = data.cities.find((c) => c.id === venue?.cityId);
    return organization && instructor && venue && city
      ? { session, organization, instructor, venue, city }
      : null;
  };
  const allItems = () =>
    data.classes.map(toItem).filter((item): item is ClassListItem => item !== null);
  const upcoming = (predicate: (item: ClassListItem) => boolean) =>
    applyClassFilters(
      allItems().filter(predicate),
      {
        when: 'any',
        levels: [],
        specialties: [],
        language: null,
        freeOnly: false,
        availableOnly: false,
      },
      now,
    );

  return {
    source: 'demo',
    discover: {
      cities: async () => data.cities,
      mapPoints: async (options) => [
        ...mapPointsOf(data),
        ...(options?.includeStressTest ? stressTestPoints(2000) : []),
      ],
      classes: async (filters, at) => applyClassFilters(allItems(), filters, at),
      organization: async (id) => {
        const organization = data.organizations.find((o) => o.id === id);
        const city = data.cities.find((c) => c.id === organization?.cityId);
        if (!organization || !city) {
          return null;
        }
        return {
          organization,
          city,
          venues: data.venues.filter((v) => v.organizationId === id),
          instructors: data.instructors.filter((i) =>
            i.affiliations.some((a) => a.organizationId === id),
          ),
          upcoming: upcoming((item) => item.organization.id === id),
        };
      },
      instructor: async (id) => {
        const instructor = data.instructors.find((i) => i.id === id);
        if (!instructor) {
          return null;
        }
        const orgIds = instructor.affiliations.map((a) => a.organizationId);
        return {
          instructor,
          organizations: data.organizations.filter((o) => orgIds.includes(o.id)),
          upcoming: upcoming((item) => item.instructor.id === id),
        };
      },
      classDetail: async (id) => {
        const session = data.classes.find((c) => c.id === id);
        return session ? toItem(session) : null;
      },
    },
    practice: {
      workouts: async (filters) =>
        data.workouts.filter((w) => {
          const minutes = w.exercises.reduce((sum, e) => sum + e.durationSec, 0) / 60;
          return (
            (!filters.focus || w.focus === filters.focus) &&
            (!filters.level || w.level === filters.level || w.level === 'all_levels') &&
            (!filters.maxMinutes || minutes <= filters.maxMinutes) &&
            (!filters.equipment || w.equipment.includes(filters.equipment))
          );
        }),
      workout: async (id) => data.workouts.find((w) => w.id === id) ?? null,
      programs: async () => data.programs,
      program: async (id) => data.programs.find((p) => p.id === id) ?? null,
    },
    connect: {
      circles: async () => data.circles,
      circle: async (id) => data.circles.find((c) => c.id === id) ?? null,
      directory: async () => ({
        organizations: data.organizations,
        instructors: data.instructors,
        cities: data.cities,
      }),
    },
  };
}
