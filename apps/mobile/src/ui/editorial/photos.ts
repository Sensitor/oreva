import todayPhoto from '../../../assets/editorial/today.jpg';
import pgFoundationsPhoto from '../../../assets/editorial/pg-foundations.jpg';
import pgOnTheGoPhoto from '../../../assets/editorial/pg-on-the-go.jpg';
import pgStrongCentrePhoto from '../../../assets/editorial/pg-strong-centre.jpg';
import wkMorningResetPhoto from '../../../assets/editorial/wk-morning-reset.jpg';
import wkCoreFoundationsPhoto from '../../../assets/editorial/wk-core-foundations.jpg';
import wkFullBodyFlowPhoto from '../../../assets/editorial/wk-full-body-flow.jpg';
import wkHipsLegsPhoto from '../../../assets/editorial/wk-hips-legs.jpg';
import wkUpperPosturePhoto from '../../../assets/editorial/wk-upper-posture.jpg';
import wkTravelStretchPhoto from '../../../assets/editorial/wk-travel-stretch.jpg';

/**
 * ORÉVA's editorial photographs (docs/design/photography.md).
 *
 * Photographs illustrate ORÉVA's own content only: the Today session, programs
 * and guided sessions. They never stand for a real studio, instructor or class
 * (decision C-8): partners appear with their own photographs, used with
 * documented permission, or with no photograph at all.
 *
 * Each slot holds a licensed photograph (Unsplash License for now, then the
 * founders' own shoot) and its credit. An empty slot shows a quiet sand
 * surface, never a stand-in picture.
 */
export type PhotoSlot =
  | 'today'
  | 'pg-foundations'
  | 'pg-on-the-go'
  | 'pg-strong-centre'
  | 'wk-morning-reset'
  | 'wk-core-foundations'
  | 'wk-full-body-flow'
  | 'wk-hips-legs'
  | 'wk-upper-posture'
  | 'wk-travel-stretch';

export interface PhotoCredit {
  photographer: string;
  /** The photograph's page, where its licence is shown. */
  url: string;
  licence: 'Unsplash License' | 'ORÉVA';
}

export interface EditorialPhoto {
  /** A bundled image (`require('…jpg')`), or null while the slot is empty. */
  source: number | null;
  credit: PhotoCredit | null;
  /** Where the subject sits (0 to 1), so crops keep it in frame. */
  focus?: { x: number; y: number };
}

const empty: EditorialPhoto = { source: null, credit: null };

function unsplash(photographer: string, url: string): PhotoCredit {
  return { photographer, url, licence: 'Unsplash License' };
}

/**
 * The selection of 26 November 2026 ("Morning on the Riviera"): half from one
 * series (Roxana Popovici, a warm cream studio with arched mirrors), the rest
 * chosen for the same light. Graded as one set by tools/photography/grade.py.
 * Licences checked on each photograph's Unsplash record (free licence, not
 * Unsplash+). The Today photograph is lightly retouched: an air-conditioning
 * unit removed from the wall (tools/photography/retouch.py).
 */
export const editorialPhotos: Record<PhotoSlot, EditorialPhoto> = {
  today: {
    source: todayPhoto,
    credit: unsplash(
      'Roxana Popovici',
      'https://unsplash.com/photos/woman-performs-pilates-on-a-reformer-machine-lKe5jm-Sypw',
    ),
    focus: { x: 0.45, y: 0.42 },
  },
  'pg-foundations': {
    source: pgFoundationsPhoto,
    credit: unsplash(
      'Roxana Popovici',
      'https://unsplash.com/photos/woman-doing-pilates-workout-on-a-reformer-machine-hiHBILFNah4',
    ),
    focus: { x: 0.45, y: 0.5 },
  },
  'pg-on-the-go': {
    source: pgOnTheGoPhoto,
    credit: unsplash(
      'Ositadinma Onyeobi',
      'https://unsplash.com/photos/archway-framing-bridge-over-water-JHGPC0NLv8s',
    ),
    focus: { x: 0.6, y: 0.45 },
  },
  'pg-strong-centre': {
    source: pgStrongCentrePhoto,
    credit: unsplash(
      'Roxana Popovici',
      'https://unsplash.com/photos/woman-doing-pilates-on-a-reformer-machine-Zp4APUiwEsM',
    ),
    focus: { x: 0.5, y: 0.45 },
  },
  'wk-morning-reset': {
    source: wkMorningResetPhoto,
    credit: unsplash(
      'Huma Kabakci',
      'https://unsplash.com/photos/black-metal-window-frame-during-daytime-mnnAa1CBrM8',
    ),
  },
  'wk-core-foundations': {
    source: wkCoreFoundationsPhoto,
    credit: unsplash(
      'David (dcube91)',
      'https://unsplash.com/photos/a-person-with-their-hands-on-a-yoga-mat-u87cFacgTNg',
    ),
    focus: { x: 0.6, y: 0.55 },
  },
  'wk-full-body-flow': {
    source: wkFullBodyFlowPhoto,
    credit: unsplash('Roxana Popovici', 'https://unsplash.com/photos/JvYE9bdyDG4'),
    focus: { x: 0.5, y: 0.4 },
  },
  'wk-hips-legs': {
    source: wkHipsLegsPhoto,
    credit: unsplash(
      'Roxana Popovici',
      'https://unsplash.com/photos/woman-does-pilates-exercise-on-a-reformer-machine-aY5uOJ2o96g',
    ),
  },
  'wk-upper-posture': {
    source: wkUpperPosturePhoto,
    credit: unsplash(
      'Amine Ben Mohamed',
      'https://unsplash.com/photos/a-woman-sitting-on-the-floor-holding-a-steering-wheel-Opuuyk1cn-o',
    ),
    focus: { x: 0.55, y: 0.5 },
  },
  'wk-travel-stretch': {
    source: wkTravelStretchPhoto,
    credit: unsplash(
      'Grigorii Shcheglov',
      'https://unsplash.com/photos/a-row-of-stone-pillars-in-a-building-LippfI8zkZM',
    ),
  },
};

export function isPhotoSlot(value: string): value is PhotoSlot {
  return value in editorialPhotos;
}

/** The photograph for a program or session, if ORÉVA has one. */
export function photoFor(id: string): EditorialPhoto {
  return isPhotoSlot(id) ? editorialPhotos[id] : empty;
}
