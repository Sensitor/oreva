import type { Exercise, LocalizedText, Program, Workout } from '@oreva/core';

/** Bundled sample videos (abstract animations made for ORÉVA, no third-party footage). */
export const DEMO_VIDEO_KEYS = ['breath', 'flow', 'core'] as const;
export type DemoVideoKey = (typeof DEMO_VIDEO_KEYS)[number];

const ex = (id: string, name: LocalizedText, durationSec: number): Exercise => ({
  id,
  name,
  durationSec,
});

const E = {
  breathing: ex(
    'breathing',
    {
      en: 'Breathing and alignment',
      fr: 'Respiration et alignement',
      ru: 'Дыхание и выравнивание',
    },
    60,
  ),
  hundredPrep: ex(
    'hundred-prep',
    { en: 'Hundred preparation', fr: 'Préparation du Hundred', ru: 'Подготовка к «Сотне»' },
    50,
  ),
  rollDown: ex(
    'roll-down',
    { en: 'Roll down', fr: 'Enroulé vers le bas', ru: 'Скручивание вниз' },
    45,
  ),
  spineTwist: ex(
    'spine-twist',
    { en: 'Spine twist', fr: 'Torsion de la colonne', ru: 'Скручивание позвоночника' },
    45,
  ),
  sideLegs: ex(
    'side-legs',
    {
      en: 'Side-lying leg series',
      fr: 'Série de jambes sur le côté',
      ru: 'Серия для ног лёжа на боку',
    },
    60,
  ),
  bridge: ex('bridge', { en: 'Shoulder bridge', fr: 'Pont d’épaules', ru: 'Плечевой мост' }, 50),
  swanPrep: ex(
    'swan-prep',
    { en: 'Swan preparation', fr: 'Préparation du cygne', ru: 'Подготовка к «Лебедю»' },
    45,
  ),
  catCow: ex('cat-cow', { en: 'Cat and cow', fr: 'Chat et vache', ru: 'Кошка и корова' }, 40),
  mermaid: ex(
    'mermaid',
    { en: 'Mermaid stretch', fr: 'Étirement de la sirène', ru: 'Растяжка «Русалка»' },
    50,
  ),
  saw: ex('saw', { en: 'Saw', fr: 'La scie', ru: 'Пила' }, 45),
  rest: ex(
    'rest',
    { en: 'Rest and breathe', fr: 'Repos et respiration', ru: 'Отдых и дыхание' },
    40,
  ),
};

/** FICTIONAL sample workouts. Titles and content are for testing only. */
export const demoWorkouts: Workout[] = [
  {
    id: 'wk-morning-reset',
    title: { en: 'Morning reset', fr: 'Réveil en douceur', ru: 'Мягкое утро' },
    description: {
      en: 'A short sample session to wake up the spine and breathe deeply.',
      fr: 'Une courte séance d’exemple pour réveiller la colonne et respirer profondément.',
      ru: 'Короткое демонстрационное занятие, чтобы разбудить позвоночник и глубоко подышать.',
    },
    level: 'beginner',
    focus: 'breath',
    equipment: ['mat'],
    exercises: [E.breathing, E.catCow, E.rollDown, E.spineTwist, E.rest],
    instructorId: 'ins-lea',
    videoKey: 'breath',
    audioLanguage: 'en',
    premium: false,
    tone: 'tileViolet',
    isPlaceholder: true,
  },
  {
    id: 'wk-core-foundations',
    title: { en: 'Core foundations', fr: 'Les bases du centre', ru: 'Основы кора' },
    description: {
      en: 'Sample session: the essentials of a stable centre, step by step.',
      fr: 'Séance d’exemple : les essentiels d’un centre stable, pas à pas.',
      ru: 'Демонстрационное занятие: основы устойчивого центра шаг за шагом.',
    },
    level: 'beginner',
    focus: 'core',
    equipment: ['mat'],
    exercises: [E.breathing, E.hundredPrep, E.bridge, E.rollDown, E.saw, E.rest],
    instructorId: 'ins-anya',
    videoKey: 'core',
    audioLanguage: 'en',
    premium: false,
    tone: 'tileMint',
    isPlaceholder: true,
  },
  {
    id: 'wk-full-body-flow',
    title: { en: 'Full body flow', fr: 'Flow corps entier', ru: 'Флоу для всего тела' },
    description: {
      en: 'Sample session linking movements into a smooth sequence.',
      fr: 'Séance d’exemple qui enchaîne les mouvements en une séquence fluide.',
      ru: 'Демонстрационное занятие с плавной связкой движений.',
    },
    level: 'intermediate',
    focus: 'full_body',
    equipment: ['mat'],
    exercises: [E.rollDown, E.hundredPrep, E.sideLegs, E.swanPrep, E.mermaid, E.rest],
    instructorId: 'ins-claire',
    videoKey: 'flow',
    audioLanguage: 'fr',
    premium: true,
    tone: 'tileOrchid',
    isPlaceholder: true,
  },
  {
    id: 'wk-hips-legs',
    title: { en: 'Hips and legs', fr: 'Hanches et jambes', ru: 'Бёдра и ноги' },
    description: {
      en: 'Sample session for the lower body, with a band if you have one.',
      fr: 'Séance d’exemple pour le bas du corps, avec un élastique si vous en avez un.',
      ru: 'Демонстрационное занятие для нижней части тела, с лентой, если она есть.',
    },
    level: 'intermediate',
    focus: 'lower_body',
    equipment: ['mat', 'band'],
    exercises: [E.bridge, E.sideLegs, E.catCow, E.rest],
    instructorId: 'ins-sofia',
    videoKey: 'flow',
    audioLanguage: 'fr',
    premium: false,
    tone: 'tileMint',
    isPlaceholder: true,
  },
  {
    id: 'wk-upper-posture',
    title: {
      en: 'Upper body and posture',
      fr: 'Haut du corps et posture',
      ru: 'Верх тела и осанка',
    },
    description: {
      en: 'Sample session for shoulders and upper back.',
      fr: 'Séance d’exemple pour les épaules et le haut du dos.',
      ru: 'Демонстрационное занятие для плеч и верхней части спины.',
    },
    level: 'all_levels',
    focus: 'upper_body',
    equipment: ['mat', 'small_ball'],
    exercises: [E.breathing, E.swanPrep, E.spineTwist, E.mermaid, E.rest],
    instructorId: 'ins-maya',
    videoKey: 'core',
    audioLanguage: 'en',
    premium: true,
    tone: 'tileViolet',
    isPlaceholder: true,
  },
  {
    id: 'wk-travel-stretch',
    title: { en: 'Travel stretch', fr: 'Étirements en voyage', ru: 'Растяжка в поездке' },
    description: {
      en: 'Sample session with no equipment, for a hotel room or a park.',
      fr: 'Séance d’exemple sans matériel, pour une chambre d’hôtel ou un parc.',
      ru: 'Демонстрационное занятие без инвентаря: для номера в отеле или парка.',
    },
    level: 'all_levels',
    focus: 'mobility',
    equipment: ['none'],
    exercises: [E.catCow, E.rollDown, E.mermaid, E.spineTwist, E.rest],
    instructorId: 'ins-nora',
    videoKey: 'breath',
    audioLanguage: 'en',
    premium: false,
    tone: 'tileOrchid',
    isPlaceholder: true,
  },
];

/** FICTIONAL sample programs. */
export const demoPrograms: Program[] = [
  {
    id: 'pg-foundations',
    title: {
      en: 'Beginner foundations',
      fr: 'Fondamentaux débutante',
      ru: 'Основы для начинающих',
    },
    description: {
      en: 'A sample four-week path to learn the basics at your own pace.',
      fr: 'Un parcours d’exemple de quatre semaines pour apprendre les bases à votre rythme.',
      ru: 'Демонстрационная программа на четыре недели, чтобы освоить основы в своём темпе.',
    },
    level: 'beginner',
    weeks: 4,
    days: [
      { day: 1, workoutId: 'wk-morning-reset' },
      { day: 2, workoutId: 'wk-core-foundations' },
      { day: 3, workoutId: null },
      { day: 4, workoutId: 'wk-travel-stretch' },
      { day: 5, workoutId: 'wk-core-foundations' },
      { day: 6, workoutId: null },
      { day: 7, workoutId: 'wk-morning-reset' },
    ],
    tone: 'tileViolet',
    isPlaceholder: true,
  },
  {
    id: 'pg-on-the-go',
    title: { en: 'Pilates on the go', fr: 'Pilates en voyage', ru: 'Пилатес в поездках' },
    description: {
      en: 'A sample two-week program with short sessions and no equipment.',
      fr: 'Un programme d’exemple de deux semaines, avec des séances courtes et sans matériel.',
      ru: 'Демонстрационная программа на две недели: короткие занятия без инвентаря.',
    },
    level: 'all_levels',
    weeks: 2,
    days: [
      { day: 1, workoutId: 'wk-travel-stretch' },
      { day: 2, workoutId: 'wk-morning-reset' },
      { day: 3, workoutId: null },
      { day: 4, workoutId: 'wk-travel-stretch' },
    ],
    tone: 'tileMint',
    isPlaceholder: true,
  },
  {
    id: 'pg-strong-centre',
    title: { en: 'Strong centre', fr: 'Un centre solide', ru: 'Сильный центр' },
    description: {
      en: 'A sample three-week program building from foundations to full flows.',
      fr: 'Un programme d’exemple de trois semaines, des bases jusqu’aux enchaînements complets.',
      ru: 'Демонстрационная программа на три недели: от основ к полным связкам.',
    },
    level: 'intermediate',
    weeks: 3,
    days: [
      { day: 1, workoutId: 'wk-core-foundations' },
      { day: 2, workoutId: 'wk-full-body-flow' },
      { day: 3, workoutId: null },
      { day: 4, workoutId: 'wk-hips-legs' },
      { day: 5, workoutId: 'wk-upper-posture' },
    ],
    tone: 'tileOrchid',
    isPlaceholder: true,
  },
];

export function workoutDurationSec(workout: Workout): number {
  return workout.exercises.reduce((sum, item) => sum + item.durationSec, 0);
}
