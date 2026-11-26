/**
 * ORÉVA's editorial photographs (docs/design/photography.md).
 *
 * Photographs illustrate ORÉVA's own content only: the Today session, programs
 * and guided sessions. They never stand for a real studio, instructor or class
 * (decision C-8): partners appear with their own photographs, used with
 * documented permission, or with no photograph at all.
 *
 * Each slot is filled with a licensed photograph (Unsplash License for now,
 * then the founders' own shoot) and its credit. An empty slot shows a quiet
 * sand surface, never a stand-in picture.
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

export const editorialPhotos: Record<PhotoSlot, EditorialPhoto> = {
  today: empty,
  'pg-foundations': empty,
  'pg-on-the-go': empty,
  'pg-strong-centre': empty,
  'wk-morning-reset': empty,
  'wk-core-foundations': empty,
  'wk-full-body-flow': empty,
  'wk-hips-legs': empty,
  'wk-upper-posture': empty,
  'wk-travel-stretch': empty,
};

export function isPhotoSlot(value: string): value is PhotoSlot {
  return value in editorialPhotos;
}

/** The photograph for a program or session, if ORÉVA has one. */
export function photoFor(id: string): EditorialPhoto {
  return isPhotoSlot(id) ? editorialPhotos[id] : empty;
}
