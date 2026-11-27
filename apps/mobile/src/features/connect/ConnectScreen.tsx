import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, KeyRound, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDirectory } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, Button, EmptyState, SampleBadge, Sheet, TAB_BAR_CLEARANCE } from '@/ui';
import { Enter, Monogram, SpringPressable } from '@/ui/editorial';
import { Medallion } from './Medallion';
import { useCircleList } from './useCircleView';

/**
 * Connect (pillar 3, P-13), editorial direction: a serif title, the two
 * ways in (create, join), private Circles as rows with their medallion, and
 * the instructors and studios you follow as a rail of monograms.
 */
export function ConnectScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { locale } = useLocaleSettings();
  const { fontFamily } = useTheme();
  const { state, update } = usePrototypeStore();
  const { circles } = useCircleList();
  const directory = useDirectory();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const followedOrgs = (directory.data?.organizations ?? []).filter((o) =>
    state.followedOrganizations.includes(o.id),
  );
  const followedInstructors = (directory.data?.instructors ?? []).filter((i) =>
    state.followedInstructors.includes(i.id),
  );
  const cityName = (cityId: string) => directory.data?.cities.find((c) => c.id === cityId)?.name;

  const createCircle = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const id = `local-${Date.now().toString(36)}`;
    update((s) => ({
      ...s,
      createdCircles: [
        { id, name: trimmed.slice(0, 60), createdAt: new Date().toISOString() },
        ...s.createdCircles,
      ],
    }));
    setName('');
    setCreateOpen(false);
    router.push(`/circles/${id}`);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: TAB_BAR_CLEARANCE + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Enter index={0} style={styles.header}>
        <AppText
          variant="display"
          color="textBrand"
          accessibilityRole="header"
          style={styles.title}
        >
          {t('pillars.connect.title')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('pillars.connect.description')}
        </AppText>
      </Enter>

      <Enter index={1} style={styles.actions}>
        <Button
          label={t('connect.create')}
          shape="pill"
          onPress={() => setCreateOpen(true)}
          testID="create-circle"
        />
        <Button
          label={t('connect.join')}
          variant="secondary"
          shape="pill"
          onPress={() => setJoinOpen(true)}
          testID="join-circle"
        />
      </Enter>

      <Enter index={2} style={styles.section}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('connect.circles')}
        </AppText>
        {circles.length === 0 ? <EmptyState title={t('connect.emptyCircles')} /> : null}
        {circles.map((circle) => {
          const last = circle.messages[circle.messages.length - 1];
          const preview =
            last?.kind === 'text'
              ? last.body
              : last?.kind === 'class_share'
                ? t('connect.sharedClass')
                : '';
          return (
            <SpringPressable
              key={circle.id}
              pressedScale={0.98}
              accessibilityRole="button"
              accessibilityLabel={`${circle.name}, ${t('connect.members', { count: circle.members.length })}`}
              onPress={() => router.push(`/circles/${circle.id}`)}
              testID={`circle-${circle.id}`}
              style={styles.circle}
            >
              <Medallion
                name={circle.name}
                members={circle.members.map((member) =>
                  member.id === 'me' ? t('connect.you') : member.displayName,
                )}
              />
              <View style={styles.flex}>
                <AppText variant="title2" color="textPrimary" numberOfLines={2}>
                  {circle.name}
                </AppText>
                <AppText variant="footnote" color="textSecondary">
                  {t('connect.members', { count: circle.members.length })}
                  {circle.challenge ? ` · ${t('connect.challenge')}` : ''}
                </AppText>
                {preview ? (
                  <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
                    {preview}
                  </AppText>
                ) : null}
                {circle.isPlaceholder ? <SampleBadge /> : null}
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
            </SpringPressable>
          );
        })}
        <View style={styles.note}>
          <ShieldCheck size={16} color={colors.textSecondary} strokeWidth={1.75} />
          <AppText variant="footnote" color="textSecondary" style={styles.flex}>
            {t('connect.privateNote')}
          </AppText>
        </View>
      </Enter>

      <Enter index={3} style={styles.section}>
        <AppText variant="title2" color="textBrand" accessibilityRole="header">
          {t('connect.following')}
        </AppText>
        {followedOrgs.length + followedInstructors.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            {t('connect.followingEmpty')}
          </AppText>
        ) : (
          // Monograms until photographs used with permission exist (P-15, C-8).
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.portraits}
          >
            {followedInstructors.map((instructor) => (
              <SpringPressable
                key={instructor.id}
                accessibilityRole="button"
                accessibilityLabel={instructor.displayName}
                onPress={() => router.push(`/instructors/${instructor.id}`)}
                pressedScale={0.96}
                style={styles.portrait}
              >
                <Monogram name={instructor.displayName} size={80} />
                <AppText variant="callout" weight="semibold" align="center" numberOfLines={2}>
                  {instructor.displayName}
                </AppText>
              </SpringPressable>
            ))}
            {followedOrgs.map((organization) => {
              const city = resolveLocalizedText(cityName(organization.cityId), locale)?.text;
              return (
                <SpringPressable
                  key={organization.id}
                  accessibilityRole="button"
                  accessibilityLabel={[organization.name, city].filter(Boolean).join(', ')}
                  onPress={() => router.push(`/organizations/${organization.id}`)}
                  pressedScale={0.96}
                  style={styles.portrait}
                >
                  <Monogram name={organization.name} size={80} tone={organization.tone} />
                  <AppText variant="callout" weight="semibold" align="center" numberOfLines={2}>
                    {organization.name}
                  </AppText>
                  {city ? (
                    <AppText variant="caption" color="textSecondary" align="center">
                      {city}
                    </AppText>
                  ) : null}
                </SpringPressable>
              );
            })}
          </ScrollView>
        )}
      </Enter>

      <Sheet visible={createOpen} title={t('connect.create')} onClose={() => setCreateOpen(false)}>
        <AppText variant="callout">{t('connect.nameLabel')}</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('connect.namePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t('connect.nameLabel')}
          maxLength={60}
          style={[styles.input, { fontFamily: fontFamily('regular') }]}
          testID="circle-name-input"
        />
        <AppText variant="footnote" color="textSecondary">
          {t('connect.createdNote')}
        </AppText>
        <Button
          label={t('connect.createCta')}
          shape="pill"
          onPress={createCircle}
          disabled={!name.trim()}
          fullWidth
          testID="confirm-create-circle"
        />
      </Sheet>

      <Sheet visible={joinOpen} title={t('connect.join')} onClose={() => setJoinOpen(false)}>
        <AppText variant="callout">{t('connect.codeLabel')}</AppText>
        <TextInput
          value={code}
          onChangeText={setCode}
          accessibilityLabel={t('connect.codeLabel')}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          style={[styles.input, { fontFamily: fontFamily('regular') }]}
        />
        <View style={styles.note}>
          <KeyRound size={16} color={colors.info} strokeWidth={1.75} />
          <AppText variant="footnote" color="info" style={styles.flex}>
            {t('connect.joinNote')}
          </AppText>
        </View>
        <Button label={t('connect.joinCta')} shape="pill" disabled fullWidth />
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 46,
    lineHeight: 52,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  section: {
    gap: spacing.sm,
  },
  // A Circle: its medallion, its name in serif, members and the last message, on a fine rule.
  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  bleed: {
    marginHorizontal: -spacing.gutter,
  },
  portraits: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  portrait: {
    width: 104,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderControl,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
