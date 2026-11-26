/**
 * Local Jest mock for react-native-reanimated 4: only the API ORÉVA uses.
 * Shared values hold plain numbers, animation builders resolve to their end
 * value, animated styles and props are computed once from the current values.
 * Behaviour on devices is Reanimated's own; this only lets screens render in
 * tests and lets tests read the values a screen asks for.
 */
const React = require('react');
const { View, ScrollView, Text, Image, FlatList } = require('react-native');

const record = { lastSpring: null, lastTiming: null, reducedMotion: false };

function useSharedValue(initial) {
  const ref = React.useRef(null);
  if (ref.current === null) {
    ref.current = {
      value: initial,
      get: () => ref.current.value,
      set: (v) => (ref.current.value = v),
    };
  }
  return ref.current;
}

const withTiming = (toValue, config, callback) => {
  record.lastTiming = { toValue, config };
  if (callback) callback(true);
  return toValue;
};
const withSpring = (toValue, config, callback) => {
  record.lastSpring = { toValue, config };
  if (callback) callback(true);
  return toValue;
};
const withDelay = (_delay, value) => value;
const withSequence = (...values) => values[values.length - 1];
const withRepeat = (value) => value;
const cancelAnimation = () => undefined;

function createAnimatedComponent(Component) {
  const Animated = React.forwardRef(function AnimatedComponent(props, ref) {
    const { entering, exiting, layout, animatedProps, style, ...rest } = props;
    void entering;
    void exiting;
    void layout;
    const resolvedStyle = Array.isArray(style)
      ? style.map((s) => (s && s.__animated ? s.value : s))
      : style && style.__animated
        ? style.value
        : style;
    const extra = animatedProps && animatedProps.__animated ? animatedProps.value : {};
    return React.createElement(Component, { ...rest, ...extra, style: resolvedStyle, ref });
  });
  Animated.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
  return Animated;
}

function useAnimatedStyle(updater) {
  return { __animated: true, value: updater() };
}
function useAnimatedProps(updater) {
  return { __animated: true, value: updater() };
}
function useDerivedValue(updater) {
  return { value: updater(), get: () => updater() };
}
function useAnimatedScrollHandler() {
  return () => undefined;
}
function useAnimatedRef() {
  return React.useRef(null);
}
function useReducedMotion() {
  return record.reducedMotion;
}

const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };
function interpolate(value, input, output, extrapolate) {
  const clamp = extrapolate === 'clamp' || (extrapolate && extrapolate.extrapolateLeft === 'clamp');
  let i = 1;
  while (i < input.length - 1 && value > input[i]) i += 1;
  const [x0, x1] = [input[i - 1], input[i]];
  const [y0, y1] = [output[i - 1], output[i]];
  let t = x1 === x0 ? 0 : (value - x0) / (x1 - x0);
  if (clamp) t = Math.min(Math.max(t, 0), 1);
  return y0 + (y1 - y0) * t;
}

const identity = (t) => t;
const Easing = new Proxy(
  {
    bezier: () => identity,
    linear: identity,
    ease: identity,
    out: () => identity,
    in: () => identity,
    inOut: () => identity,
  },
  { get: (target, key) => (key in target ? target[key] : identity) },
);

const ReduceMotion = { System: 'system', Always: 'always', Never: 'never' };

/** Layout animation builders: chainable no-ops. */
function builder() {
  const chain = new Proxy(function () {}, {
    get: () => () => chain,
    apply: () => chain,
  });
  return chain;
}
const FadeIn = builder();
const FadeInDown = builder();
const FadeInUp = builder();
const FadeOut = builder();
const LinearTransition = builder();

const Animated = {
  View: createAnimatedComponent(View),
  ScrollView: createAnimatedComponent(ScrollView),
  Text: createAnimatedComponent(Text),
  Image: createAnimatedComponent(Image),
  FlatList: createAnimatedComponent(FlatList),
  createAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useReducedMotion,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
  interpolate,
  Extrapolation,
  Easing,
  ReduceMotion,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  LinearTransition,
  /** Test helper: read the last animation asked for, set the system preference. */
  __record: record,
};
