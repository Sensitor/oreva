import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import type * as ExpoRouter from 'expo-router';
import { HomeScreen } from '@/features/home/HomeScreen';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { editorialPhotos, photoFor } from '@/ui/editorial';
import { LA_LIGNE_BOX, LA_LIGNE_LENGTH, LA_LIGNE_OUTLINE } from '@/ui/editorial/laLignePath';
import { renderWithProviders, TEST_NOW } from '@/test-utils';

jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof ExpoRouter>('expo-router');
  return {
    ...actual,
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});
jest.mock('@/theme/useReduceMotion', () => ({ useReduceMotion: jest.fn(() => false) }));

afterEach(() => {
  jest.mocked(useReduceMotion).mockReturnValue(false);
});

describe('Today, editorial direction', () => {
  it('shows one photograph, decorative for VoiceOver, and the signature hidden too', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    await screen.findAllByText('Beginner foundations');
    expect(screen.getByTestId('today-hero', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId('today-signature')).toBeNull();
    expect(screen.getByTestId('today-signature', { includeHiddenElements: true })).toBeTruthy();
  });

  it('keeps one clear action: start today’s session', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    const start = await screen.findByRole('button', { name: "Start today's session" });
    expect(start).toBeTruthy();
    expect(screen.getAllByRole('button', { name: "Start today's session" })).toHaveLength(1);
  });

  it('shows classes as cards with their full spoken label, never with a stock photograph', async () => {
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    const [card] = await screen.findAllByTestId('today-class-cls-1');
    expect(String(card?.props.accessibilityLabel)).toMatch(/Sunrise mat, Atelier Rivage/);
    // Partner classes have no editorial photograph (decision C-8).
    expect(photoFor('cls-1').source).toBeNull();
    expect(photoFor('org-atelier-rivage').source).toBeNull();
  });

  it('renders the same with Reduce Motion on', async () => {
    jest.mocked(useReduceMotion).mockReturnValue(true);
    await renderWithProviders(<HomeScreen now={TEST_NOW} />);
    expect((await screen.findAllByText('Beginner foundations')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: "Start today's session" })).toBeTruthy();
  });
});

describe('La Ligne, drawn by hand', () => {
  it('is one closed, tapered shape inside its box', () => {
    expect(LA_LIGNE_OUTLINE.startsWith('M')).toBe(true);
    expect(LA_LIGNE_OUTLINE.endsWith('Z')).toBe(true);
    const numbers = LA_LIGNE_OUTLINE.match(/-?\d+\.\d+/g)?.map(Number) ?? [];
    expect(numbers.length).toBeGreaterThan(100);
    for (let i = 0; i < numbers.length; i += 2) {
      expect(numbers[i]).toBeGreaterThanOrEqual(0);
      expect(numbers[i]).toBeLessThanOrEqual(LA_LIGNE_BOX.width);
      expect(numbers[i + 1]).toBeGreaterThanOrEqual(0);
      expect(numbers[i + 1]).toBeLessThanOrEqual(LA_LIGNE_BOX.height);
    }
    // Longer than its chord: a curve, not a straight rule.
    expect(LA_LIGNE_LENGTH).toBeGreaterThan(154);
  });
});

describe('Editorial photographs', () => {
  it('credits every photograph it uses, with its licence', () => {
    for (const [slot, photo] of Object.entries(editorialPhotos)) {
      if (photo.source !== null) {
        expect({ slot, credit: photo.credit }).toEqual({
          slot,
          credit: expect.objectContaining({
            photographer: expect.any(String),
            url: expect.stringMatching(/^https:\/\//),
          }),
        });
      }
    }
  });

  it('only covers ORÉVA’s own content: today, programs and guided sessions', () => {
    for (const slot of Object.keys(editorialPhotos)) {
      expect(slot).toMatch(/^(today|pg-|wk-)/);
    }
  });
});
