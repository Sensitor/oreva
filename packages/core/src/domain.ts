import type { Locale } from '@oreva/i18n';
import type { LocalizedText } from './localized';

/**
 * Domain types shared by the mobile app, the portal, the demo data and (from
 * Phase 4) the Supabase implementation. They mirror the data model in the
 * technical plan (section 5). Shapes are what the *client* receives: private
 * venues never carry exact coordinates or addresses (decisions P-03, P-12).
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export type LaunchStatus = 'hidden' | 'coming_soon' | 'live';

export interface City {
  id: string;
  name: LocalizedText;
  countryCode: string;
  timeZone: string;
  currency: string;
  center: GeoPoint;
  launchStatus: LaunchStatus;
  isPlaceholder: boolean;
}

export type OrganizationType = 'studio' | 'independent_instructor' | 'community' | 'brand';
export type PartnerTier = 'founding_partner' | 'partner' | 'none';
export type SpecialtyCode = 'mat' | 'reformer' | 'outdoor' | 'barre' | 'stretch';
export type CardTone = 'tileMint' | 'tileViolet' | 'tileOrchid';

export interface Organization {
  id: string;
  /** Trading name, shown as is in every language. */
  name: string;
  type: OrganizationType;
  partnerTier: PartnerTier;
  cityId: string;
  description: LocalizedText;
  specialties: SpecialtyCode[];
  /** Languages classes are taught in. */
  instructionLanguages: string[];
  tone: CardTone;
  isPlaceholder: boolean;
}

export interface InstructorAffiliation {
  organizationId: string;
}

export interface Instructor {
  id: string;
  displayName: string;
  bio: LocalizedText;
  specialties: SpecialtyCode[];
  /** ISO 639-1 codes. */
  spokenLanguages: string[];
  /** Always shown as "declared", never as verified, until ORÉVA verifies them. */
  qualificationsDeclared: LocalizedText;
  affiliations: InstructorAffiliation[];
  isPlaceholder: boolean;
}

export type AddressVisibility = 'public' | 'after_booking';

export interface ApproximateArea {
  center: GeoPoint;
  radiusMeters: number;
}

/**
 * A place where classes happen. A public venue has an exact location; a private
 * one only has an approximate area. The exact point of a private venue never
 * reaches the client before booking.
 */
export type Venue = {
  id: string;
  organizationId: string;
  cityId: string;
  name: LocalizedText;
  kind: 'outdoor' | 'studio';
  isPlaceholder: boolean;
} & (
  | { visibility: 'public'; location: GeoPoint; addressLine: string; approximateArea: null }
  | {
      visibility: 'after_booking';
      location: null;
      addressLine: null;
      approximateArea: ApproximateArea;
    }
);

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type PaymentMode = 'free' | 'pay_at_venue';

export interface ClassSession {
  id: string;
  organizationId: string;
  instructorId: string;
  venueId: string;
  title: LocalizedText;
  sourceLanguage: Locale;
  instructionLanguages: string[];
  /** ISO 8601 instant (UTC). Shown in the venue city's time zone. */
  startsAt: string;
  durationMin: number;
  level: Level;
  specialty: SpecialtyCode;
  capacity: number;
  spotsLeft: number;
  paymentMode: PaymentMode;
  /** Display only in V1 (P-04): paid at the venue, never in the app. */
  priceMinor: number | null;
  currency: string;
  isPlaceholder: boolean;
}

/** A point on the Discover map (one per venue). */
export interface MapPoint {
  id: string;
  venueId: string;
  organizationId: string;
  cityId: string;
  /** Exact for public venues; centre of the approximate area for private ones. */
  coordinate: GeoPoint;
  approximateRadiusMeters: number | null;
  upcomingClasses: number;
  isPlaceholder: boolean;
}

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------

export type Focus = 'core' | 'full_body' | 'lower_body' | 'upper_body' | 'mobility' | 'breath';
export type Equipment = 'mat' | 'band' | 'small_ball' | 'none';

export interface Exercise {
  id: string;
  name: LocalizedText;
  durationSec: number;
}

export interface Workout {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  level: Level;
  focus: Focus;
  equipment: Equipment[];
  exercises: Exercise[];
  instructorId: string | null;
  /** Key of a bundled sample video (demo) or, later, a signed playback id. */
  videoKey: string;
  audioLanguage: string;
  premium: boolean;
  tone: CardTone;
  isPlaceholder: boolean;
}

export interface ProgramDay {
  day: number;
  workoutId: string | null;
}

export interface Program {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  level: Level;
  weeks: number;
  days: ProgramDay[];
  tone: CardTone;
  isPlaceholder: boolean;
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

export interface CircleMember {
  id: string;
  displayName: string;
  /** Members choose whether their activity is visible in the Circle (off by default). */
  sharesActivity: boolean;
}

export type CircleMessage = {
  id: string;
  authorId: string;
  sentAt: string;
} & (
  | { kind: 'text'; body: string }
  | { kind: 'class_share'; classId: string }
  | { kind: 'system'; event: 'joined' | 'challenge_started' }
);

export interface CircleChallenge {
  id: string;
  /** User content: not translated. */
  title: string;
  targetSessions: number;
  startsOn: string;
  endsOn: string;
  /** Sessions completed, only for members who share their activity. */
  progress: Record<string, number>;
}

export interface Circle {
  id: string;
  /** User content: not translated (Addendum A). */
  name: string;
  description: string;
  members: CircleMember[];
  messages: CircleMessage[];
  challenge: CircleChallenge | null;
  isPlaceholder: boolean;
}

/** The current member in demo data. */
export const DEMO_SELF_ID = 'me';
