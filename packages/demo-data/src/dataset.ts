import type {
  Circle,
  City,
  ClassSession,
  Instructor,
  MapPoint,
  Organization,
  Program,
  Venue,
  Workout,
} from '@oreva/core';
import { demoCities } from './cities';
import { buildDemoClasses } from './classes';
import { buildDemoCircles, demoFollowing } from './connect';
import { demoInstructors } from './instructors';
import { demoOrganizations } from './organizations';
import { demoPrograms, demoWorkouts } from './practice';
import { demoVenues } from './venues';

export interface DemoDataset {
  cities: City[];
  organizations: Organization[];
  instructors: Instructor[];
  venues: Venue[];
  classes: ClassSession[];
  workouts: Workout[];
  programs: Program[];
  circles: Circle[];
  following: { organizationIds: string[]; instructorIds: string[] };
}

/** The complete FICTIONAL dataset, with dates computed from `now`. */
export function createDemoDataset(now: Date = new Date()): DemoDataset {
  return {
    cities: demoCities,
    organizations: demoOrganizations,
    instructors: demoInstructors,
    venues: demoVenues,
    classes: buildDemoClasses(now),
    workouts: demoWorkouts,
    programs: demoPrograms,
    circles: buildDemoCircles(now),
    following: demoFollowing,
  };
}

/** One map point per venue, as the future `discover_map_points` RPC will return them. */
export function mapPointsOf(dataset: DemoDataset): MapPoint[] {
  return dataset.venues.map((venue) => ({
    id: `pt-${venue.id}`,
    venueId: venue.id,
    organizationId: venue.organizationId,
    cityId: venue.cityId,
    coordinate: venue.visibility === 'public' ? venue.location : venue.approximateArea.center,
    approximateRadiusMeters:
      venue.visibility === 'public' ? null : venue.approximateArea.radiusMeters,
    upcomingClasses: dataset.classes.filter((c) => c.venueId === venue.id).length,
    isPlaceholder: true,
  }));
}

/**
 * Extra anonymous points for the map performance check (decision note 0002,
 * section 7): `count` points scattered around the demo cities. Deterministic.
 */
export function stressTestPoints(count = 2000): MapPoint[] {
  let seed = 42;
  const random = () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    return seed / 2_147_483_648;
  };
  return Array.from({ length: count }, (_, i) => {
    const city = demoCities[i % demoCities.length] as City;
    return {
      id: `stress-${i}`,
      venueId: `stress-${i}`,
      organizationId: 'stress',
      cityId: city.id,
      coordinate: {
        latitude: city.center.latitude + (random() - 0.5) * 0.3,
        longitude: city.center.longitude + (random() - 0.5) * 0.4,
      },
      approximateRadiusMeters: null,
      upcomingClasses: 0,
      isPlaceholder: true,
    };
  });
}
