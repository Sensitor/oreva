import type {
  Circle,
  City,
  ClassSession,
  GeoPoint,
  Instructor,
  Level,
  MapPoint,
  Organization,
  Program,
  SpecialtyCode,
  Venue,
  Workout,
  Focus,
  Equipment,
} from '@oreva/core';

/**
 * Repository interfaces (decision C-2): screens depend on these, never on where
 * data comes from. Phase 2 uses the demo implementation; from Phase 4 each
 * domain switches to a Supabase implementation without touching the screens.
 */

export interface ClassFilters {
  when: 'today' | 'week' | 'any';
  levels: Level[];
  specialties: SpecialtyCode[];
  language: string | null;
  freeOnly: boolean;
  availableOnly: boolean;
}

export const DEFAULT_CLASS_FILTERS: ClassFilters = {
  when: 'any',
  levels: [],
  specialties: [],
  language: null,
  freeOnly: false,
  availableOnly: false,
};

export interface ClassListItem {
  session: ClassSession;
  organization: Organization;
  instructor: Instructor;
  venue: Venue;
  city: City;
}

export interface OrganizationProfile {
  organization: Organization;
  city: City;
  venues: Venue[];
  instructors: Instructor[];
  upcoming: ClassListItem[];
}

export interface InstructorProfile {
  instructor: Instructor;
  organizations: Organization[];
  upcoming: ClassListItem[];
}

export interface DiscoverRepository {
  cities(): Promise<City[]>;
  mapPoints(options?: { includeStressTest?: boolean }): Promise<MapPoint[]>;
  classes(filters: ClassFilters, now: Date): Promise<ClassListItem[]>;
  organization(id: string): Promise<OrganizationProfile | null>;
  instructor(id: string): Promise<InstructorProfile | null>;
  classDetail(id: string): Promise<ClassListItem | null>;
}

export interface WorkoutFilters {
  focus: Focus | null;
  level: Level | null;
  maxMinutes: number | null;
  equipment: Equipment | null;
}

export const DEFAULT_WORKOUT_FILTERS: WorkoutFilters = {
  focus: null,
  level: null,
  maxMinutes: null,
  equipment: null,
};

export interface PracticeRepository {
  workouts(filters: WorkoutFilters): Promise<Workout[]>;
  workout(id: string): Promise<Workout | null>;
  programs(): Promise<Program[]>;
  program(id: string): Promise<Program | null>;
}

export interface ConnectRepository {
  circles(): Promise<Circle[]>;
  circle(id: string): Promise<Circle | null>;
  suggestedFollowing(): Promise<{ organizations: Organization[]; instructors: Instructor[] }>;
}

export interface OrevaRepositories {
  source: DataSourceName;
  discover: DiscoverRepository;
  practice: PracticeRepository;
  connect: ConnectRepository;
}

export type DataSourceName = 'demo' | 'unavailable';

export type { GeoPoint };
