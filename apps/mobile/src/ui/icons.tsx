import { colors } from '@oreva/tokens';
import type { ComponentType, ReactNode } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Any icon the UI accepts: an ORÉVA icon below, or a Lucide icon for utilities. */
export type IconComponent = ComponentType<IconProps>;

/**
 * ORÉVA icon set: drawn on a 24 grid, a single 1.5 stroke with round caps and
 * joins, no fills. Decorative by design: the control that holds an icon
 * carries the spoken label.
 */
function makeIcon(name: string, shape: ReactNode): IconComponent {
  function Icon({ size = 24, color = colors.textPrimary, strokeWidth = 1.5 }: IconProps) {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID={`icon-${name}`}
      >
        <G
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {shape}
        </G>
      </Svg>
    );
  }
  Icon.displayName = `OrevaIcon(${name})`;
  return Icon;
}

/** Today: a sun resting on the line. */
export const TodayIcon = makeIcon(
  'today',
  <>
    <Path d="M7 15a5 5 0 0 1 10 0" />
    <Path d="M12 5v2M5.6 8.1l1.4 1.4M18.4 8.1 17 9.5" />
    <Path d="M3 19c3-1.6 6 1.6 9 0s6-1.6 9 0" />
  </>,
);

/** Discover: a compass with a soft needle. */
export const DiscoverIcon = makeIcon(
  'discover',
  <>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M15.2 8.8 13.4 13.4 8.8 15.2 10.6 10.6Z" />
  </>,
);

/** Practice: play, held in a circle. */
export const PracticeIcon = makeIcon(
  'practice',
  <>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M10.2 8.6v6.8l5.4-3.4Z" />
  </>,
);

/** Connect: two circles that overlap. */
export const ConnectIcon = makeIcon(
  'connect',
  <>
    <Circle cx={9} cy={12} r={5.5} />
    <Circle cx={15} cy={12} r={5.5} />
  </>,
);

export const ProfileIcon = makeIcon(
  'profile',
  <>
    <Circle cx={12} cy={8} r={3.5} />
    <Path d="M5 20c.8-3.6 3.7-5.5 7-5.5s6.2 1.9 7 5.5" />
  </>,
);

export const PlayIcon = makeIcon('play', <Path d="M8 5.5v13l10.5-6.5Z" />);

export const PauseIcon = makeIcon('pause', <Path d="M9 5.5v13M15 5.5v13" />);

export const CompleteIcon = makeIcon(
  'complete',
  <>
    <Circle cx={12} cy={12} r={9} />
    <Path d="m8 12.4 2.8 2.8L16 9.6" />
  </>,
);

export const LotusIcon = makeIcon(
  'lotus',
  <>
    <Path d="M12 5c2.4 2.6 2.4 8.6 0 12-2.4-3.4-2.4-9.4 0-12Z" />
    <Path d="M12 17c-3.6 0-7-2.6-8-7 3 0 5.8 1.4 7.1 4" />
    <Path d="M12 17c3.6 0 7-2.6 8-7-3 0-5.8 1.4-7.1 4" />
    <Path d="M6 20h12" />
  </>,
);

/** A mat, half rolled. */
export const MatIcon = makeIcon(
  'mat',
  <>
    <Path d="M3 19h14M3 15.5h10.6" />
    <Circle cx={17} cy={15.5} r={3.5} />
    <Circle cx={17} cy={15.5} r={1.2} />
  </>,
);

export const BreathIcon = makeIcon(
  'breath',
  <>
    <Path d="M4 8c2.7-1.8 5.3 1.8 8 0s5.3-1.8 8 0" />
    <Path d="M4 12c2.7-1.8 5.3 1.8 8 0s5.3-1.8 8 0" />
    <Path d="M4 16c2.7-1.8 5.3 1.8 8 0s5.3-1.8 8 0" />
  </>,
);

/** Near me: a pin. */
export const NearIcon = makeIcon(
  'near',
  <>
    <Path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <Circle cx={12} cy={10} r={2.3} />
  </>,
);

/** The full set, for the style guide and tests. */
export const orevaIcons = {
  today: TodayIcon,
  discover: DiscoverIcon,
  practice: PracticeIcon,
  connect: ConnectIcon,
  profile: ProfileIcon,
  play: PlayIcon,
  pause: PauseIcon,
  complete: CompleteIcon,
  lotus: LotusIcon,
  mat: MatIcon,
  breath: BreathIcon,
  near: NearIcon,
} as const;

export type OrevaIconName = keyof typeof orevaIcons;
