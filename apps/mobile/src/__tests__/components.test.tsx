import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { colors, motion } from '@oreva/tokens';
import { fireEvent, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Animated, StyleSheet } from 'react-native';
import { useReduceMotion } from '@/theme/useReduceMotion';
import { pathFromPoints, pathLength, pointAt, wavePoints } from '@/ui/lineGeometry';
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
  Voile,
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

describe('La Ligne', () => {
  it('stays inside its box and is longer than straight', () => {
    const points = wavePoints(200, 18, { cycles: 2.5 }, 5);
    expect(points.length).toBeGreaterThan(10);
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(5);
      expect(point.x).toBeLessThanOrEqual(195);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(18);
    }
    expect(pathLength(points)).toBeGreaterThan(190);
    expect(pathFromPoints(points)).toMatch(/^M5\.00 /);
    expect(pointAt(points, 1)?.x).toBeCloseTo(195);
    expect(wavePoints(0, 18)).toEqual([]);
  });

  it('is a labelled progress bar in its progress form', async () => {
    await renderWithProviders(
      <Line
        variant="progress"
        value={3 / 7}
        steps={7}
        width={300}
        accessibilityLabel="Program progress"
      />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Program progress' });
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 43 });
  });

  it('is hidden from screen readers when decorative', async () => {
    await renderWithProviders(<Line testID="underline" />);
    expect(screen.queryByTestId('underline')).toBeNull();
    expect(screen.getByTestId('underline', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('Voile and EditorialCover', () => {
  it('renders content on a voile', async () => {
    await renderWithProviders(
      <Voile tint="sand" testID="voile">
        <AppText>{'Inside'}</AppText>
      </Voile>,
    );
    expect(screen.getByText('Inside')).toBeTruthy();
  });

  it('sets paper text on the plum voile and becomes one button when pressable', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <EditorialCover
        tint="plum"
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
    await renderWithProviders(<EditorialCover title="Long spine" />);
    expect(screen.getByRole('header', { name: 'Long spine' })).toBeTruthy();
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
