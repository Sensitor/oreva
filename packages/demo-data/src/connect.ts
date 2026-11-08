import { DEMO_SELF_ID, type Circle } from '@oreva/core';

const daysFrom = (now: Date, days: number, hour = 9): string => {
  const d = new Date(now.getTime() + days * 86_400_000);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

const isoDate = (now: Date, days: number) => daysFrom(now, days).slice(0, 10);

/**
 * FICTIONAL Circles. Members are invented first names. Messages are user
 * content: they stay in the language they were written in (Addendum A).
 */
export function buildDemoCircles(now: Date): Circle[] {
  return [
    {
      id: 'circle-morning-crew',
      name: 'Morning crew',
      description: 'Sample Circle: early sessions before work, Monaco and Nice.',
      members: [
        { id: DEMO_SELF_ID, displayName: 'You', sharesActivity: true },
        { id: 'm-ines', displayName: 'Inès', sharesActivity: true },
        { id: 'm-katya', displayName: 'Katya', sharesActivity: true },
        { id: 'm-giulia', displayName: 'Giulia', sharesActivity: false },
        { id: 'm-sam', displayName: 'Sam', sharesActivity: true },
      ],
      messages: [
        {
          id: 'msg-1',
          authorId: 'm-ines',
          sentAt: daysFrom(now, -2, 6),
          kind: 'system',
          event: 'challenge_started',
        },
        {
          id: 'msg-2',
          authorId: 'm-ines',
          sentAt: daysFrom(now, -2, 7),
          kind: 'text',
          body: 'Qui vient au cours du lever du soleil demain ?',
        },
        {
          id: 'msg-3',
          authorId: 'm-katya',
          sentAt: daysFrom(now, -2, 8),
          kind: 'text',
          body: 'Я буду! See you on the beach 🌅',
        },
        {
          id: 'msg-4',
          authorId: 'm-sam',
          sentAt: daysFrom(now, -1, 18),
          kind: 'class_share',
          classId: 'cls-1',
        },
        {
          id: 'msg-5',
          authorId: DEMO_SELF_ID,
          sentAt: daysFrom(now, -1, 19),
          kind: 'text',
          body: 'Booked it, thanks Sam!',
        },
      ],
      challenge: {
        id: 'ch-8-in-4',
        title: '8 sessions in 4 weeks',
        targetSessions: 8,
        startsOn: isoDate(now, -7),
        endsOn: isoDate(now, 21),
        progress: { [DEMO_SELF_ID]: 3, 'm-ines': 4, 'm-katya': 2, 'm-sam': 5 },
      },
      isPlaceholder: true,
    },
    {
      id: 'circle-weekend-riviera',
      name: 'Weekend Riviera',
      description: 'Sample Circle: Saturday classes and a coffee after.',
      members: [
        { id: DEMO_SELF_ID, displayName: 'You', sharesActivity: true },
        { id: 'm-ines', displayName: 'Inès', sharesActivity: true },
        { id: 'm-lou', displayName: 'Lou', sharesActivity: false },
      ],
      messages: [
        {
          id: 'msg-6',
          authorId: 'm-lou',
          sentAt: daysFrom(now, -3, 10),
          kind: 'system',
          event: 'joined',
        },
        {
          id: 'msg-7',
          authorId: 'm-lou',
          sentAt: daysFrom(now, -3, 11),
          kind: 'text',
          body: 'Hello! Happy to be here.',
        },
      ],
      challenge: null,
      isPlaceholder: true,
    },
  ];
}

/** Organizations and instructors the demo member follows. */
export const demoFollowing = {
  organizationIds: ['org-atelier-rivage', 'org-linden-london'],
  instructorIds: ['ins-lea', 'ins-claire'],
};
