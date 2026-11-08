import { distanceMeters } from '@oreva/core';
import { describe, expect, it } from 'vitest';
import { DEMO_VIDEO_KEYS, createDemoDataset, mapPointsOf, stressTestPoints } from './index';

const NOW = new Date('2026-11-14T08:30:00Z');
const data = createDemoDataset(NOW);

describe('demo data is fictional and identified (C-3, A-06)', () => {
  it('marks every item as placeholder', () => {
    const all = [
      ...data.cities,
      ...data.organizations,
      ...data.instructors,
      ...data.venues,
      ...data.classes,
      ...data.workouts,
      ...data.programs,
      ...data.circles,
    ];
    expect(all.length).toBeGreaterThan(50);
    expect(all.every((item) => item.isPlaceholder)).toBe(true);
  });

  it('never names the real Founding Partner', () => {
    expect(JSON.stringify(data).toLowerCase()).not.toMatch(/gym\s*&?\s*tonic/);
  });

  it('says it is fictional in every organization description and instructor bio', () => {
    for (const org of data.organizations) {
      expect(org.description.en?.toLowerCase()).toContain('fictional');
    }
    for (const instructor of data.instructors) {
      expect(instructor.bio.en?.toLowerCase()).toContain('fictional');
      expect(instructor.qualificationsDeclared.en?.toLowerCase()).toContain('not verified');
    }
  });

  it('covers the five cities the founders want to test', () => {
    const ids = data.cities.map((c) => c.id);
    for (const id of ['monaco', 'paris', 'london', 'dubai', 'new-york']) {
      expect(ids).toContain(id);
      expect(data.organizations.some((o) => o.cityId === id)).toBe(true);
    }
  });
});

describe('privacy of venues (P-03, P-12)', () => {
  it('private venues carry no exact location or address, only an approximate area', () => {
    const privateVenues = data.venues.filter((v) => v.visibility === 'after_booking');
    expect(privateVenues.length).toBeGreaterThan(3);
    for (const venue of privateVenues) {
      expect(venue.location).toBeNull();
      expect(venue.addressLine).toBeNull();
      expect(venue.approximateArea?.radiusMeters).toBeGreaterThanOrEqual(300);
    }
  });

  it('map points of private venues are approximate areas', () => {
    for (const point of mapPointsOf(data)) {
      const venue = data.venues.find((v) => v.id === point.venueId);
      expect(point.approximateRadiusMeters === null).toBe(venue?.visibility === 'public');
    }
  });

  it('venues are in their city', () => {
    for (const venue of data.venues) {
      const city = data.cities.find((c) => c.id === venue.cityId);
      const point = venue.visibility === 'public' ? venue.location : venue.approximateArea.center;
      if (!city) {
        throw new Error(`unknown city ${venue.cityId}`);
      }
      expect(distanceMeters(point, city.center)).toBeLessThan(25_000);
    }
  });
});

describe('references are consistent', () => {
  it('organizations have three-language descriptions (A-03)', () => {
    for (const org of data.organizations) {
      expect(org.description.en && org.description.fr && org.description.ru).toBeTruthy();
    }
  });

  it('instructors can belong to several organizations (P-02)', () => {
    expect(
      data.instructors.filter((i) => i.affiliations.length >= 2).length,
    ).toBeGreaterThanOrEqual(3);
    for (const instructor of data.instructors) {
      for (const a of instructor.affiliations) {
        expect(data.organizations.some((o) => o.id === a.organizationId)).toBe(true);
      }
    }
  });

  it('each class is taught by an instructor affiliated with its organization, in its city currency', () => {
    for (const cls of data.classes) {
      const venue = data.venues.find((v) => v.id === cls.venueId);
      const instructor = data.instructors.find((i) => i.id === cls.instructorId);
      const city = data.cities.find((c) => c.id === venue?.cityId);
      expect(venue?.organizationId).toBe(cls.organizationId);
      expect(instructor?.affiliations.map((a) => a.organizationId)).toContain(cls.organizationId);
      expect(cls.currency).toBe(city?.currency);
      expect(cls.spotsLeft).toBeLessThanOrEqual(cls.capacity);
      expect(cls.paymentMode === 'free').toBe(cls.priceMinor === null);
    }
  });

  it('classes are in the future and at sensible local hours', () => {
    for (const cls of data.classes) {
      const venue = data.venues.find((v) => v.id === cls.venueId);
      const city = data.cities.find((c) => c.id === venue?.cityId);
      if (!city) {
        throw new Error(`no city for ${cls.id}`);
      }
      expect(new Date(cls.startsAt).getTime()).toBeGreaterThan(NOW.getTime());
      const hour = Number(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          hourCycle: 'h23',
          timeZone: city.timeZone,
        }).format(new Date(cls.startsAt)),
      );
      expect(hour).toBeGreaterThanOrEqual(6);
      expect(hour).toBeLessThanOrEqual(20);
    }
  });

  it('programs and workouts reference existing content and bundled videos', () => {
    for (const program of data.programs) {
      for (const day of program.days) {
        if (day.workoutId) {
          expect(data.workouts.some((w) => w.id === day.workoutId)).toBe(true);
        }
      }
    }
    for (const workout of data.workouts) {
      expect(DEMO_VIDEO_KEYS as readonly string[]).toContain(workout.videoKey);
      expect(workout.exercises.length).toBeGreaterThan(2);
    }
  });

  it('circles reference real demo classes and members', () => {
    for (const circle of data.circles) {
      const memberIds = circle.members.map((m) => m.id);
      for (const message of circle.messages) {
        expect(memberIds).toContain(message.authorId);
        if (message.kind === 'class_share') {
          expect(data.classes.some((c) => c.id === message.classId)).toBe(true);
        }
      }
      for (const memberId of Object.keys(circle.challenge?.progress ?? {})) {
        const member = circle.members.find((m) => m.id === memberId);
        expect(member?.sharesActivity).toBe(true);
      }
    }
  });
});

describe('stress test points', () => {
  it('generates the requested number deterministically', () => {
    const a = stressTestPoints(2000);
    const b = stressTestPoints(2000);
    expect(a).toHaveLength(2000);
    expect(a[1999]).toEqual(b[1999]);
  });
});
