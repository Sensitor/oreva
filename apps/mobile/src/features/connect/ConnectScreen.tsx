import { resolveLocalizedText } from '@oreva/core';
import { colors, radii, spacing } from '@oreva/tokens';
import { router } from 'expo-router';
import { ChevronRight, KeyRound, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useDirectory } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useTheme } from '@/theme/ThemeProvider';
import {
  AppText,
  Avatar,
  Card,
  EmptyState,
  PillButton,
  SampleBadge,
  Screen,
  Section,
  Sheet,
} from '@/ui';
import { useCircleList } from './useCircleView';

/** Connect (pillar 3, P-13): private Circles and the instructors and studios you follow. */
export function ConnectScreen() {
  const { t } = useTranslation();
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
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t('pillars.connect.title')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('pillars.connect.description')}
      </AppText>

      <View style={styles.actions}>
        <PillButton
          label={t('connect.create')}
          onPress={() => setCreateOpen(true)}
          testID="create-circle"
        />
        <PillButton
          label={t('connect.join')}
          tone="light"
          onPress={() => setJoinOpen(true)}
          testID="join-circle"
        />
      </View>

      <Section title={t('connect.circles')}>
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
            <Pressable
              key={circle.id}
              accessibilityRole="button"
              accessibilityLabel={`${circle.name}, ${t('connect.members', { count: circle.members.length })}`}
              onPress={() => router.push(`/circles/${circle.id}`)}
              testID={`circle-${circle.id}`}
            >
              <Card style={styles.circle}>
                <View style={styles.avatars}>
                  {circle.members.slice(0, 4).map((member, index) => (
                    <View key={member.id} style={[styles.avatarWrap, index > 0 && styles.overlap]}>
                      <Avatar
                        name={member.id === 'me' ? t('connect.you') : member.displayName}
                        size={36}
                        tone={
                          (['tileViolet', 'tileMint', 'tileOrchid', 'backgroundTint'] as const)[
                            index % 4
                          ]
                        }
                      />
                    </View>
                  ))}
                </View>
                <View style={styles.flex}>
                  <AppText variant="headline" numberOfLines={2}>
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
                <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
              </Card>
            </Pressable>
          );
        })}
        <View style={styles.note}>
          <ShieldCheck size={16} color={colors.textSecondary} strokeWidth={1.75} />
          <AppText variant="footnote" color="textSecondary" style={styles.flex}>
            {t('connect.privateNote')}
          </AppText>
        </View>
      </Section>

      <Section title={t('connect.following')}>
        {followedOrgs.length + followedInstructors.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            {t('connect.followingEmpty')}
          </AppText>
        ) : (
          <Card padded={false}>
            {followedInstructors.map((instructor) => (
              <Pressable
                key={instructor.id}
                accessibilityRole="button"
                accessibilityLabel={instructor.displayName}
                onPress={() => router.push(`/instructors/${instructor.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Avatar name={instructor.displayName} size={40} />
                <AppText variant="bodyStrong" style={styles.flex}>
                  {instructor.displayName}
                </AppText>
                <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
              </Pressable>
            ))}
            {followedOrgs.map((organization) => (
              <Pressable
                key={organization.id}
                accessibilityRole="button"
                accessibilityLabel={organization.name}
                onPress={() => router.push(`/organizations/${organization.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={[styles.swatch, { backgroundColor: colors[organization.tone] }]} />
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{organization.name}</AppText>
                  <AppText variant="footnote" color="textSecondary">
                    {resolveLocalizedText(cityName(organization.cityId), locale)?.text}
                  </AppText>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
              </Pressable>
            ))}
          </Card>
        )}
      </Section>

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
        <PillButton
          label={t('connect.createCta')}
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
        <PillButton label={t('connect.joinCta')} disabled fullWidth />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatars: {
    flexDirection: 'row',
  },
  avatarWrap: {
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  overlap: {
    marginStart: -14,
  },
  flex: {
    flex: 1,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderControl,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
