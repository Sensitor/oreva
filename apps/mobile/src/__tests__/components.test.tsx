import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { colors, motion } from '@oreva/tokens';
import { fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import * as fs from 'fs';
import * as path from 'path';
import { Animated, StyleSheet } from 'react-native';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { weekOf } from '@/lib/week';
import {
  Button,
  Chip,
  EditorialCover,
  IconButton,
  Line,
  NearIcon,
  orevaIcons,
  PressableScale,
  SampleBadge,
  CutShape,
  FactList,
  Masthead,
  Reveal,
  WeekStones,
} from '@/ui';
import { AppText } from '@/ui';
import { renderWithProviders } from '@/test-utils';

jest.mock('@/theme/useReduceMotion', () => ({ useReduceMotion: jest.fn(() => false) }));

afterEach(() => {
  jest.clearAllMocks();
  jest.mocked(useReduceMotion).mockReturnValue(false);
});

describe('Button', () => {
  it('fires a light haptic on the primary action only', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <>
        <Button label="Book" onPress={onPress} />
        <Button label="Later" variant="secondary" onPress={onPress} />
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Book' }));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    await fireEvent.press(screen.getByRole('button', { name: 'Later' }));
    expect(onPress).toHaveBeenCalledTimes(2);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('announces and blocks a disabled button', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Book" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Book' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('uses plum with a cream label for the primary action, ink on lavender', async () => {
    await renderWithProviders(
      <>
        <Button label="Primary" testID="primary" />
        <Button label="Accent" variant="accent" testID="accent" />
      </>,
    );
    const background = (testID: string) =>
      StyleSheet.flatten(screen.getByTestId(testID).props.style).backgroundColor as string;
    expect(background('primary')).toBe(colors.actionPrimary);
    expect(background('accent')).toBe(colors.accent);
    expect(StyleSheet.flatten(screen.getByText('Accent').props.style).color).toBe(
      colors.textOnAccent,
    );
    expect(StyleSheet.flatten(screen.getByText('Primary').props.style).color).toBe(
      colors.textOnAction,
    );
  });
});

describe('Chip', () => {
  it('announces selection and gives a selection haptic', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <>
        <Chip label="Reformer" selected onPress={onPress} />
        <Chip label="Mat" onPress={onPress} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Reformer' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Mat' })).not.toBeSelected();
    await fireEvent.press(screen.getByRole('button', { name: 'Mat' }));
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('PressableScale', () => {
  it('scales softly on press', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    await renderWithProviders(
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Card"
        onPress={() => undefined}
      >
        <AppText>{'Card'}</AppText>
      </PressableScale>,
    );
    await fireEvent(screen.getByRole('button', { name: 'Card' }), 'pressIn');
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: motion.pressScale, duration: motion.duration.fast }),
    );
    timing.mockRestore();
  });

  it('does not move when Reduce Motion is on', async () => {
    jest.mocked(useReduceMotion).mockReturnValue(true);
    const timing = jest.spyOn(Animated, 'timing');
    await renderWithProviders(
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Card"
        onPress={() => undefined}
      >
        <AppText>{'Card'}</AppText>
      </PressableScale>,
    );
    await fireEvent(screen.getByRole('button', { name: 'Card' }), 'pressIn');
    expect(timing).not.toHaveBeenCalled();
    timing.mockRestore();
  });
});

describe('IconButton', () => {
  it('accepts ORÉVA icons and requires a spoken label', async () => {
    await renderWithProviders(
      <IconButton
        icon={NearIcon}
        accessibilityLabel="Near me"
        floating
        onPress={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Near me' })).toBeTruthy();
    expect(screen.getByTestId('icon-near', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('SampleBadge', () => {
  it('reads as a small uppercase tag', async () => {
    await renderWithProviders(<SampleBadge />);
    const text = screen.getByText('Sample data', { includeHiddenElements: true });
    expect(StyleSheet.flatten(text.props.style).textTransform).toBe('uppercase');
    expect(StyleSheet.flatten(text.props.style).color).toBe(colors.textOnPastelSecondary);
  });
});

describe('Rules (La Ligne, printed)', () => {
  it('is a labelled progress bar in its progress form', async () => {
    await renderWithProviders(
      <Line variant="progress" value={3 / 7} steps={7} accessibilityLabel="Program progress" />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Program progress' });
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 43 });
  });

  it('is hidden from screen readers when decorative', async () => {
    await renderWithProviders(<Line testID="underline" />);
    expect(screen.queryByTestId('underline')).toBeNull();
    expect(screen.getByTestId('underline', { includeHiddenElements: true })).toBeTruthy();
  });

  it('grows to its value in 600 ms, or is drawn at once with Reduce Motion', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    await renderWithProviders(<Line variant="progress" value={0.5} accessibilityLabel="P" />);
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0.5, duration: motion.duration.progress }),
    );
    timing.mockClear();
    jest.mocked(useReduceMotion).mockReturnValue(true);
    await renderWithProviders(<Line variant="progress" value={0.5} accessibilityLabel="P" />);
    expect(timing).not.toHaveBeenCalled();
    timing.mockRestore();
  });
});

describe('Printed blocks', () => {
  it('sets paper text on the plum block and becomes one button when pressable', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <EditorialCover
        tone="plum"
        kicker="Week 1"
        title="Long spine"
        meta="20 min"
        onPress={onPress}
      />,
    );
    const cover = screen.getByRole('button', { name: 'Long spine, 20 min' });
    expect(StyleSheet.flatten(screen.getByText('Long spine').props.style).color).toBe(
      colors.textOnAccentStrong,
    );
    await fireEvent.press(cover);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the title as a header when not pressable', async () => {
    await renderWithProviders(<EditorialCover title="Long spine" tone="paper" />);
    expect(screen.getByRole('header', { name: 'Long spine' })).toBeTruthy();
  });

  it('keeps gradients out of the app (identity C-9: flat colour only)', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name)) {
          files.push(full);
        }
      }
    };
    walk(path.join(__dirname, '..'));
    const offenders = files.filter((file) =>
      /expo-linear-gradient|LinearGradient|RadialGradient/.test(fs.readFileSync(file, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('lays the cut-paper shapes only when asked, hidden from screen readers', async () => {
    await renderWithProviders(
      <>
        <EditorialCover title="Plain" />
        <EditorialCover title="Strong moment" tone="plum" shapes numeral="01" />
      </>,
    );
    expect(screen.queryAllByTestId(/^cut-/)).toHaveLength(0);
    // The numeral is decorative: the title carries the meaning.
    expect(screen.queryByText('01')).toBeNull();
    expect(screen.getByText('01', { includeHiddenElements: true })).toBeTruthy();
  });

  it('opens a page with the masthead and lists facts with dotted leaders', async () => {
    await renderWithProviders(
      <>
        <Masthead label="Tuesday 24 November" />
        <FactList facts={[{ label: 'Duration', value: '20 min' }]} onPlum />
      </>,
    );
    expect(screen.getByText('Tuesday 24 November')).toBeTruthy();
    expect(screen.getByLabelText('Duration, 20 min')).toBeTruthy();
  });
});

describe('Cut paper and motion', () => {
  it('settles a shape like paper laid down, unless Reduce Motion is on', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    await renderWithProviders(
      <CutShape shape="sun" size={80} color={colors.accentSoft} delay={120} />,
    );
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: motion.duration.slow, delay: 120 }),
    );
    timing.mockClear();
    jest.mocked(useReduceMotion).mockReturnValue(true);
    await renderWithProviders(<CutShape shape="sun" size={80} color={colors.accentSoft} />);
    expect(timing).not.toHaveBeenCalled();
    timing.mockRestore();
  });

  it('staggers screen entrances, first five only, and skips them with Reduce Motion', async () => {
    const timing = jest.spyOn(Animated, 'timing');
    await renderWithProviders(
      <>
        <Reveal index={2}>
          <AppText>{'Third'}</AppText>
        </Reveal>
        <Reveal index={7}>
          <AppText>{'Eighth'}</AppText>
        </Reveal>
      </>,
    );
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: motion.duration.entrance,
        delay: 2 * motion.stagger,
      }),
    );
    timing.mockClear();
    jest.mocked(useReduceMotion).mockReturnValue(true);
    await renderWithProviders(
      <Reveal index={0}>
        <AppText>{'First'}</AppText>
      </Reveal>,
    );
    expect(timing).not.toHaveBeenCalled();
    expect(screen.getByText('First')).toBeTruthy();
    timing.mockRestore();
  });

  it('fills one stone per day with a finished session', async () => {
    await renderWithProviders(
      <WeekStones
        days={[true, false, true, false, false, false, false]}
        labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        accessibilityLabel="2 sessions this week"
      />,
    );
    expect(screen.getByLabelText('2 sessions this week')).toBeTruthy();
    const count = (id: string) =>
      screen.queryAllByTestId(id, { includeHiddenElements: true }).length;
    expect(count('stone-done')).toBe(2);
    expect(count('stone-empty')).toBe(5);
  });

  it('counts the week from Monday, in the phone time zone, from finished sessions only', () => {
    // Wednesday 25 November 2026, 10:00 local time.
    const now = new Date(2026, 10, 25, 10, 0).getTime();
    const at = (d: number, h: number) => new Date(2026, 10, d, h, 0).toISOString();
    const result = weekOf(
      [
        { completedAt: at(22, 9) }, // Sunday: last week
        { completedAt: at(23, 8) }, // Monday
        { completedAt: at(25, 7) }, // Wednesday
        { completedAt: at(25, 9) }, // Wednesday again
      ],
      now,
    );
    expect(result.week).toBe(3);
    expect(result.total).toBe(4);
    expect(result.days).toEqual([true, false, true, false, false, false, false]);
  });
});

describe('ORÉVA icons', () => {
  it('has twelve decorative icons', async () => {
    const names = Object.keys(orevaIcons);
    expect(names).toHaveLength(12);
    await renderWithProviders(
      <>
        {Object.entries(orevaIcons).map(([name, Icon]) => (
          <Icon key={name} />
        ))}
      </>,
    );
    for (const name of names) {
      expect(screen.queryByTestId(`icon-${name}`)).toBeNull();
      expect(screen.getByTestId(`icon-${name}`, { includeHiddenElements: true })).toBeTruthy();
    }
  });
});

describe('La Ligne steps', () => {
  it('fills a step only once it is done', async () => {
    const count = (id: string) =>
      screen.queryAllByTestId(id, { includeHiddenElements: true }).length;
    await renderWithProviders(
      <Line variant="progress" value={0} steps={4} accessibilityLabel="Steps" />,
    );
    expect(count('line-step-done')).toBe(0);
    expect(count('line-step-todo')).toBe(4);
    await renderWithProviders(
      <Line variant="progress" value={2 / 4} steps={4} accessibilityLabel="Steps" />,
    );
    expect(count('line-step-done')).toBe(2);
  });
});
