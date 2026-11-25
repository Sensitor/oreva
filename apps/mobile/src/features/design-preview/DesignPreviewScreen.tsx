import { LOCALE_INFO, SUPPORTED_LOCALES } from '@oreva/i18n';
import {
  AA_MINIMUM,
  colors,
  contrastPairs,
  contrastRatio,
  elevation,
  motion,
  palette,
  radii,
  spacing,
  textStyles,
  typefaces,
  type TextStyleName,
} from '@oreva/tokens';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  AppText,
  Badge,
  Button,
  Chip,
  CutShape,
  EditorialCover,
  EditorialHeader,
  IconButton,
  FactList,
  Line,
  LinkRow,
  NearIcon,
  orevaIcons,
  ProgressRing,
  SampleBadge,
  Screen,
  ToggleRow,
  WeekStones,
  type ButtonVariant,
  type CutShapeName,
  type OrevaIconName,
} from '@/ui';
import { weekdayLabels } from '@/lib/week';

type SwatchKey =
  'cream' | 'paper' | 'sand' | 'lilac' | 'lavender' | 'iris' | 'plum' | 'ink' | 'stone' | 'sage';

/** The approved palette (24 Nov 2026), in the order of the design direction. */
const SWATCHES: readonly { key: SwatchKey; hex: string }[] = [
  { key: 'cream', hex: palette.cream[100] },
  { key: 'paper', hex: palette.cream[50] },
  { key: 'sand', hex: palette.cream[200] },
  { key: 'lilac', hex: palette.lavender[100] },
  { key: 'lavender', hex: palette.lavender[400] },
  { key: 'iris', hex: palette.lavender[600] },
  { key: 'plum', hex: palette.plum[700] },
  { key: 'ink', hex: palette.plum[900] },
  { key: 'stone', hex: palette.stone[500] },
  { key: 'sage', hex: palette.sage[600] },
];

const SCALE: readonly TextStyleName[] = [
  'display',
  'title1',
  'title2',
  'headline',
  'body',
  'callout',
  'footnote',
  'kicker',
];

const RADII = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const DEPTHS = ['soft', 'raised', 'floating'] as const;
const MOTIONS = [
  { key: 'press', ms: motion.duration.fast },
  { key: 'tab', ms: motion.duration.base },
  { key: 'entrance', ms: motion.duration.entrance },
  { key: 'progress', ms: motion.duration.progress },
] as const;

const BUTTONS: readonly ButtonVariant[] = ['primary', 'secondary', 'accent', 'quiet', 'text'];
const CHIPS = ['chipSelected', 'chipOption', 'chipOther'] as const;
const CUT_SHAPES: readonly { name: CutShapeName; color: string }[] = [
  { name: 'sun', color: palette.lavender[100] },
  { name: 'leaf', color: palette.plum[700] },
  { name: 'seed', color: palette.lavender[400] },
  { name: 'pebble', color: palette.cream[500] },
];
const SAMPLE_NUMERAL = '01';
const ICON_NAMES = Object.keys(orevaIcons) as OrevaIconName[];

/** Sample numerals for the serif: a class time and a timer, as the app shows them. */
const SAMPLE_TIME = '07:30';
const SAMPLE_TIMER = '01:00';

/** Technical labels (token names and sizes) for this developer screen. */
function scaleLabel(name: TextStyleName): string {
  const style = textStyles[name];
  return [
    name,
    typefaces[style.family].label,
    `${String(style.fontSize)}/${String(style.lineHeight)}`,
  ].join(' · ');
}

function spacingLabel(key: keyof typeof spacing): string {
  return [key, String(spacing[key])].join(' · ');
}

const passingPairs = contrastPairs.filter(
  (pair) =>
    contrastRatio(colors[pair.foreground], colors[pair.background]) >= AA_MINIMUM[pair.kind],
).length;

/**
 * Living style guide (development and staging builds only): the ORÉVA tokens
 * as the app renders them, with type samples in English, French and Russian so
 * Cyrillic and accents can be checked on the device.
 */
export function DesignPreviewScreen() {
  const { t, i18n } = useTranslation();
  const [chip, setChip] = useState<(typeof CHIPS)[number]>('chipSelected');
  const [toggle, setToggle] = useState(true);

  return (
    <Screen withTabBar={false}>
      <View style={styles.header}>
        <AppText variant="kicker" color="textLink">
          {t('designPreview.kicker')}
        </AppText>
        <AppText variant="display" color="textBrand" accessibilityRole="header">
          {t('designPreview.title')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('designPreview.intro')}
        </AppText>
      </View>

      <Section title={t('designPreview.sections.color')}>
        <View style={styles.swatches}>
          {SWATCHES.map((swatch) => (
            <View key={swatch.key} style={styles.swatch} testID={`swatch-${swatch.key}`}>
              <View style={[styles.chip, { backgroundColor: swatch.hex }]} />
              <AppText variant="bodyStrong">{t(`designPreview.colors.${swatch.key}.name`)}</AppText>
              <AppText variant="caption" color="textSecondary">
                {swatch.hex}
              </AppText>
              <AppText variant="footnote" color="textSecondary">
                {t(`designPreview.colors.${swatch.key}.role`)}
              </AppText>
            </View>
          ))}
        </View>
        {passingPairs === contrastPairs.length ? (
          <View style={styles.note}>
            <AppText variant="footnote" color="success">
              {t('designPreview.contrast', { count: passingPairs })}
            </AppText>
          </View>
        ) : null}
      </Section>

      <Section title={t('designPreview.sections.type')}>
        <AppText variant="footnote" color="textSecondary">
          {t('designPreview.typeNote')}
        </AppText>
        {SUPPORTED_LOCALES.map((code) => {
          const tl = i18n.getFixedT(code);
          return (
            <View key={code} style={styles.specimen} testID={`specimen-${code}`}>
              <AppText variant="caption" color="textSecondary">
                {LOCALE_INFO[code].nativeName}
              </AppText>
              <AppText variant="kicker" color="textLink" accessibilityLanguage={code}>
                {tl('designPreview.sampleKicker')}
              </AppText>
              <AppText variant="display" color="textBrand" accessibilityLanguage={code}>
                {tl('designPreview.sampleHeadline')}
              </AppText>
              <AppText variant="title2" color="textBrand" accessibilityLanguage={code}>
                {tl('home.headline')}
              </AppText>
              <AppText variant="body" accessibilityLanguage={code}>
                {tl('designPreview.sampleBody')}
              </AppText>
              <View style={styles.numerals}>
                <AppText variant="numeral" color="textBrand">
                  {SAMPLE_TIME}
                </AppText>
                <AppText variant="footnote" color="textSecondary" accessibilityLanguage={code}>
                  {tl('home.upcoming.spotsLeft', { count: 3 })}
                </AppText>
              </View>
            </View>
          );
        })}
        <View style={styles.scale}>
          {SCALE.map((name) => {
            const style = textStyles[name];
            return (
              <View key={name} style={styles.scaleRow}>
                <AppText variant="caption" color="textSecondary" style={styles.scaleMeta}>
                  {scaleLabel(name)}
                </AppText>
                <AppText
                  variant={name}
                  color={style.family === 'serif' ? 'textBrand' : 'textPrimary'}
                >
                  {t('designPreview.sampleHeadline')}
                </AppText>
              </View>
            );
          })}
          <AppText variant="numeralSmall" color="textBrand">
            {SAMPLE_TIMER}
          </AppText>
        </View>
      </Section>

      <Section title={t('designPreview.sections.shape')}>
        <View style={styles.radii}>
          {RADII.map((key) => (
            <View key={key} style={styles.radiusItem}>
              <View style={[styles.radiusBox, { borderRadius: radii[key] }]} />
              <AppText variant="caption" color="textSecondary">
                {String(radii[key])}
              </AppText>
            </View>
          ))}
        </View>
        <View style={styles.spacing}>
          {(['xxs', 'xs', 'sm', 'md', 'gutter', 'lg', 'xl', 'section'] as const).map((key) => (
            <View key={key} style={styles.spacingRow}>
              <View style={[styles.spacingBar, { width: spacing[key] * 3 }]} />
              <AppText variant="caption" color="textSecondary">
                {spacingLabel(key)}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('designPreview.sections.depth')}>
        <View style={styles.depths}>
          {DEPTHS.map((key) => (
            <View key={key} style={[styles.depthCard, { boxShadow: elevation[key] }]}>
              <AppText variant="callout">{t(`designPreview.depth.${key}`)}</AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('designPreview.sections.motion')}>
        <View style={styles.rows}>
          {MOTIONS.map((item) => (
            <View key={item.key} style={styles.motionRow}>
              <AppText variant="body">{t(`designPreview.motion.${item.key}`)}</AppText>
              <AppText variant="callout" color="textSecondary">
                {t('designPreview.motionValue', { ms: item.ms })}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="footnote" color="textSecondary">
          {t('designPreview.reduceMotion')}
        </AppText>
      </Section>

      <Section title={t('designPreview.sections.components')}>
        <Sub title={t('designPreview.components.buttons')}>
          <View style={styles.stack}>
            {BUTTONS.map((variant) => (
              <Button
                key={variant}
                variant={variant}
                label={t(`designPreview.components.${variant}`)}
                onPress={() => undefined}
                testID={`button-${variant}`}
              />
            ))}
            <Button label={t('designPreview.components.disabled')} disabled />
          </View>
          <View style={styles.plumPanel}>
            <Button
              variant="paper"
              label={t('designPreview.components.paper')}
              withArrow
              onPress={() => undefined}
              testID="button-paper"
            />
          </View>
          <AppText variant="footnote" color="textSecondary">
            {t('designPreview.components.buttonsNote')}
          </AppText>
        </Sub>
        <Sub title={t('designPreview.components.chips')}>
          <View style={styles.wrap}>
            {CHIPS.map((key) => (
              <Chip
                key={key}
                label={t(`designPreview.components.${key}`)}
                selected={chip === key}
                onPress={() => setChip(key)}
              />
            ))}
          </View>
        </Sub>
        <Sub title={t('designPreview.components.tags')}>
          <View style={styles.wrap}>
            <SampleBadge />
            <Badge label={t('specialty.reformer')} />
            <Badge label={t('level.beginner')} tone="backgroundTint" />
            <Badge label={t('specialty.outdoor')} tone="successSurface" />
          </View>
        </Sub>
        <Sub title={t('designPreview.components.iconButtons')}>
          <View style={styles.wrap}>
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel={t('a11y.back')}
              onPress={() => undefined}
            />
            <IconButton
              icon={Bell}
              accessibilityLabel={t('a11y.notifications')}
              onPress={() => undefined}
            />
            <IconButton
              icon={NearIcon}
              accessibilityLabel={t('discover.nearMe')}
              onPress={() => undefined}
              floating
            />
          </View>
          <AppText variant="footnote" color="textSecondary">
            {t('designPreview.components.iconNote')}
          </AppText>
        </Sub>
        <Sub title={t('designPreview.components.rows')}>
          <View style={styles.rows}>
            <LinkRow
              icon={orevaIcons.lotus}
              label={t('designPreview.components.rowLink')}
              hint={t('designPreview.components.rowHint')}
              onPress={() => undefined}
            />
            <ToggleRow
              icon={orevaIcons.breath}
              label={t('designPreview.components.rowToggle')}
              value={toggle}
              onValueChange={setToggle}
            />
          </View>
        </Sub>
        <Sub title={t('designPreview.components.progress')}>
          <View style={styles.wrap}>
            <ProgressRing progress={0.4} />
            <ProgressRing progress={0.7} size={112} strokeWidth={5} />
          </View>
        </Sub>
      </Section>

      <Section title={t('designPreview.sections.signatures')}>
        <Sub title={t('designPreview.signatures.header')}>
          <EditorialHeader
            kicker={t('designPreview.signatures.headerKicker')}
            title={t('designPreview.signatures.headerTitle')}
            intro={t('designPreview.signatures.headerIntro')}
          />
        </Sub>
        <Sub title={t('designPreview.signatures.line')}>
          <AppText variant="footnote" color="textSecondary">
            {t('designPreview.signatures.lineNote')}
          </AppText>
          <View style={styles.lines}>
            <Line />
            <Line variant="tab" />
          </View>
          <Line
            variant="progress"
            value={3 / 7}
            steps={7}
            accessibilityLabel={t('designPreview.signatures.lineProgress')}
            testID="line-progress"
          />
        </Sub>
        <Sub title={t('designPreview.signatures.cutPaper')}>
          <AppText variant="footnote" color="textSecondary">
            {t('designPreview.signatures.cutPaperNote')}
          </AppText>
          <View style={styles.shapes}>
            {CUT_SHAPES.map(({ name, color }) => (
              <View key={name} style={styles.shapeCell} testID={`cut-${name}`}>
                <View style={styles.shapeBox}>
                  <CutShape shape={name} size={name === 'seed' ? 26 : 56} color={color} />
                </View>
                <AppText variant="caption" color="textSecondary">
                  {t(`designPreview.signatures.shapeNames.${name}`)}
                </AppText>
              </View>
            ))}
          </View>
          <WeekStones
            days={[true, false, true, false, false, false, false]}
            labels={weekdayLabels(i18n.language)}
            accessibilityLabel={t('designPreview.signatures.weekExample')}
          />
        </Sub>
        <Sub title={t('designPreview.signatures.cover')}>
          <EditorialCover
            tone="paper"
            kicker={t('designPreview.signatures.coverKicker')}
            title={t('designPreview.signatures.coverTitle')}
            meta={t('designPreview.signatures.coverMeta')}
            badge={<SampleBadge />}
          >
            <FactList
              facts={[
                { label: t('classDetail.level'), value: t('level.beginner') },
                {
                  label: t('classDetail.duration'),
                  value: t('common.durationMinutes', { count: 20 }),
                },
              ]}
            />
          </EditorialCover>
          <EditorialCover
            tone="sand"
            kicker={t('designPreview.signatures.coverKicker')}
            title={t('designPreview.signatures.coverTitle')}
            meta={t('designPreview.signatures.coverMeta')}
          />
          <EditorialCover
            tone="plum"
            shapes
            numeral={SAMPLE_NUMERAL}
            kicker={t('designPreview.signatures.coverKicker')}
            title={t('designPreview.signatures.coverTitle')}
            meta={t('designPreview.signatures.coverMeta')}
          >
            <Button
              variant="paper"
              label={t('designPreview.components.paper')}
              withArrow
              fullWidth
              onPress={() => undefined}
            />
          </EditorialCover>
        </Sub>
        <Sub title={t('designPreview.signatures.icons')}>
          <View style={styles.icons}>
            {ICON_NAMES.map((name) => {
              const Icon = orevaIcons[name];
              return (
                <View key={name} style={styles.iconCell}>
                  <Icon size={28} color={colors.textBrand} />
                  <AppText variant="caption" color="textSecondary" align="center" numberOfLines={1}>
                    {t(`designPreview.signatures.iconNames.${name}`)}
                  </AppText>
                </View>
              );
            })}
          </View>
          <AppText variant="footnote" color="textSecondary">
            {t('designPreview.signatures.iconsNote')}
          </AppText>
        </Sub>
      </Section>

      <AppText variant="footnote" color="textSecondary">
        {t('designPreview.note')}
      </AppText>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="title2" color="textBrand" accessibilityRole="header">
        {title}
      </AppText>
      <View style={styles.rule} />
      {children}
    </View>
  );
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sub}>
      <AppText variant="kicker" color="textSecondary">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sub: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  stack: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  plumPanel: {
    backgroundColor: colors.actionPrimary,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lines: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  shapes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shapeCell: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  shapeBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  iconCell: {
    width: '25%',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  header: {
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatch: {
    width: '46%',
    gap: 2,
  },
  chip: {
    height: 64,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.xxs,
  },
  note: {
    backgroundColor: colors.successSurface,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  specimen: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  numerals: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  scale: {
    gap: spacing.sm,
  },
  scaleRow: {
    gap: 2,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  scaleMeta: {
    fontVariant: ['tabular-nums'],
  },
  radii: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  radiusItem: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  radiusBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  spacing: {
    gap: spacing.xs,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spacingBar: {
    height: 8,
    borderRadius: radii.xs,
    backgroundColor: colors.progress,
  },
  depths: {
    gap: spacing.md,
  },
  depthCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  rows: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  motionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
});
