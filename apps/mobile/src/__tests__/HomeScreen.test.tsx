import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { HomeScreen } from '@/features/home/HomeScreen';
import { renderWithProviders } from '@/test-utils';

const NOW = new Date('2026-11-14T08:30:00Z'); // Saturday, 09:30 in Monaco

describe('Home', () => {
  let warn: ReturnType<typeof jest.spyOn>;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    // No translation may be missing in any language.
    const missing = warn.mock.calls.filter((args: unknown[]) => String(args[0]).includes('[i18n]'));
    expect(missing).toEqual([]);
    warn.mockRestore();
  });

  it.each([
    ['en', 'Welcome to your Pilates moment', 'Upcoming classes', '3 spots left'],
    ['fr', 'Bienvenue dans votre moment Pilates', 'Prochains cours', '3 places restantes'],
    ['ru', 'Ваше время для пилатеса', 'Ближайшие занятия', 'Осталось 3 места'],
  ] as const)('renders fully translated in %s', async (locale, headline, upcoming, spots) => {
    await renderWithProviders(<HomeScreen now={NOW} />, locale);
    expect(await screen.findByText(headline)).toBeTruthy();
    expect(screen.getByText(upcoming)).toBeTruthy();
    expect(screen.getByText(spots)).toBeTruthy();
  });

  it('labels every placeholder card as sample data outside production', async () => {
    await renderWithProviders(<HomeScreen now={NOW} />);
    // Today card + 2 classes + 2 programs.
    expect(screen.getAllByText('Sample data')).toHaveLength(5);
  });

  it('shows class times in the class time zone', async () => {
    await renderWithProviders(<HomeScreen now={NOW} />);
    // Sample classes are at 08:00 and 18:00 Monaco time (UTC+1 in November),
    // whatever the phone's time zone. The test device formats times in US English.
    expect(screen.getByRole('button', { name: /Sun, Nov 15 8:00 AM/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Mon, Nov 16 6:00 PM/ })).toBeTruthy();
  });

  it('gives the start button a spoken label', async () => {
    await renderWithProviders(<HomeScreen now={NOW} />);
    expect(screen.getByRole('button', { name: "Start today's session" })).toBeTruthy();
  });

  it('announces the selected category chip', async () => {
    await renderWithProviders(<HomeScreen now={NOW} />);
    const core = screen.getByRole('button', { name: 'Core' });
    expect(core).not.toBeSelected();
    await fireEvent.press(core);
    expect(screen.getByRole('button', { name: 'Core' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'All' })).not.toBeSelected();
  });
});
