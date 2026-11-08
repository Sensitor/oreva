import type { Instructor } from '@oreva/core';

const declared = {
  en: 'Declared by the instructor: comprehensive mat Pilates training. Not verified (fictional profile).',
  fr: 'Déclaré par l’instructrice : formation complète en Pilates mat. Non vérifié (profil fictif).',
  ru: 'Со слов инструктора: полная подготовка по пилатесу на мате. Не проверено (вымышленный профиль).',
};

const declaredReformer = {
  en: 'Declared by the instructor: mat and reformer training. Not verified (fictional profile).',
  fr: 'Déclaré par l’instructrice : formation mat et reformer. Non vérifié (profil fictif).',
  ru: 'Со слов инструктора: подготовка по мату и реформеру. Не проверено (вымышленный профиль).',
};

/**
 * FICTIONAL instructors. First name and initial only, no photos. Several are
 * affiliated with more than one organization (decision P-02).
 */
export const demoInstructors: Instructor[] = [
  {
    id: 'ins-lea',
    displayName: 'Léa M.',
    bio: {
      en: 'Fictional instructor for testing. Calm, precise classes with a focus on breath and alignment.',
      fr: 'Instructrice fictive pour les tests. Des cours calmes et précis, centrés sur la respiration et l’alignement.',
      ru: 'Вымышленный инструктор для тестов. Спокойные и точные занятия с акцентом на дыхание и выравнивание.',
    },
    specialties: ['mat', 'outdoor'],
    spokenLanguages: ['fr', 'en'],
    qualificationsDeclared: declared,
    affiliations: [
      { organizationId: 'org-atelier-rivage' },
      { organizationId: 'org-matins-bleus' },
      { organizationId: 'org-lumen-nice' },
    ],
    isPlaceholder: true,
  },
  {
    id: 'ins-anya',
    displayName: 'Anya K.',
    bio: {
      en: 'Fictional instructor for testing. Reformer and mat classes, taught in English and Russian.',
      fr: 'Instructrice fictive pour les tests. Cours de reformer et de mat, en anglais et en russe.',
      ru: 'Вымышленный инструктор для тестов. Занятия на реформере и мате на английском и русском.',
    },
    specialties: ['reformer', 'mat'],
    spokenLanguages: ['en', 'ru'],
    qualificationsDeclared: declaredReformer,
    affiliations: [
      { organizationId: 'org-atelier-rivage' },
      { organizationId: 'org-northbank-london' },
    ],
    isPlaceholder: true,
  },
  {
    id: 'ins-sofia',
    displayName: 'Sofia R.',
    bio: {
      en: 'Fictional instructor for testing. Energetic outdoor sessions by the sea.',
      fr: 'Instructrice fictive pour les tests. Des séances dynamiques en plein air, face à la mer.',
      ru: 'Вымышленный инструктор для тестов. Энергичные занятия на открытом воздухе у моря.',
    },
    specialties: ['outdoor', 'stretch'],
    spokenLanguages: ['fr', 'en', 'it'],
    qualificationsDeclared: declared,
    affiliations: [
      { organizationId: 'org-matins-bleus' },
      { organizationId: 'org-croisette-collective' },
    ],
    isPlaceholder: true,
  },
  {
    id: 'ins-claire',
    displayName: 'Claire D.',
    bio: {
      en: 'Fictional independent instructor for testing. Small groups in Paris parks.',
      fr: 'Instructrice indépendante fictive pour les tests. Petits groupes dans les parcs parisiens.',
      ru: 'Вымышленный независимый инструктор для тестов. Небольшие группы в парижских парках.',
    },
    specialties: ['mat', 'outdoor'],
    spokenLanguages: ['fr', 'en'],
    qualificationsDeclared: declared,
    affiliations: [{ organizationId: 'org-claire-d' }, { organizationId: 'org-velours-paris' }],
    isPlaceholder: true,
  },
  {
    id: 'ins-maya',
    displayName: 'Maya S.',
    bio: {
      en: 'Fictional instructor for testing. Reformer flows and barre.',
      fr: 'Instructrice fictive pour les tests. Enchaînements au reformer et barre.',
      ru: 'Вымышленный инструктор для тестов. Связки на реформере и барре.',
    },
    specialties: ['reformer', 'barre'],
    spokenLanguages: ['fr', 'en'],
    qualificationsDeclared: declaredReformer,
    affiliations: [{ organizationId: 'org-velours-paris' }],
    isPlaceholder: true,
  },
  {
    id: 'ins-nora',
    displayName: 'Nora B.',
    bio: {
      en: 'Fictional instructor for testing. Gentle mat classes and stretching in the park.',
      fr: 'Instructrice fictive pour les tests. Cours de mat en douceur et étirements au parc.',
      ru: 'Вымышленный инструктор для тестов. Мягкие занятия на мате и растяжка в парке.',
    },
    specialties: ['mat', 'stretch', 'outdoor'],
    spokenLanguages: ['en'],
    qualificationsDeclared: declared,
    affiliations: [{ organizationId: 'org-linden-london' }],
    isPlaceholder: true,
  },
  {
    id: 'ins-zara',
    displayName: 'Zara A.',
    bio: {
      en: 'Fictional instructor for testing. Sunrise beach sessions and evening mat.',
      fr: 'Instructrice fictive pour les tests. Séances sur la plage au lever du soleil et mat en soirée.',
      ru: 'Вымышленный инструктор для тестов. Занятия на пляже на рассвете и вечерний мат.',
    },
    specialties: ['outdoor', 'mat'],
    spokenLanguages: ['en', 'ar'],
    qualificationsDeclared: declared,
    affiliations: [{ organizationId: 'org-dune-dubai' }],
    isPlaceholder: true,
  },
  {
    id: 'ins-hana',
    displayName: 'Hana T.',
    bio: {
      en: 'Fictional instructor for testing. Reformer classes in New York, travelling to London.',
      fr: 'Instructrice fictive pour les tests. Cours de reformer à New York, de passage à Londres.',
      ru: 'Вымышленный инструктор для тестов. Занятия на реформере в Нью-Йорке, иногда в Лондоне.',
    },
    specialties: ['reformer', 'mat'],
    spokenLanguages: ['en'],
    qualificationsDeclared: declaredReformer,
    affiliations: [{ organizationId: 'org-hudson-nyc' }, { organizationId: 'org-linden-london' }],
    isPlaceholder: true,
  },
];
