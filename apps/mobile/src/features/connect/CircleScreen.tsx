import { DEMO_SELF_ID, resolveLocalizedText, type Circle, type CircleMessage } from '@oreva/core';
import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { router } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClassDetail } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { classWhen } from '@/lib/format';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, EmptyState, LotusIcon, SampleBadge, ScreenHeader, Skeleton } from '@/ui';
import {
  DetailLayout,
  dropCap,
  Enter,
  Monogram,
  ProgressThread,
  SpringPressable,
} from '@/ui/editorial';
import { useCircleView } from './useCircleView';

const MAX_MESSAGE_LENGTH = 1000;

/**
 * A private Circle (Connect, P-13), editorial direction: it opens on lilac
 * with the Circle's initial as a drop cap; then its name in serif, its
 * members as monograms, the challenge with a thread per member, and the
 * conversation, with the composer kept at the bottom.
 */
export function CircleScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useTheme();
  const { update } = usePrototypeStore();
  const { circle, isLoading } = useCircleView(id);
  const [draft, setDraft] = useState('');

  if (isLoading && !circle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Skeleton height={300} />
      </View>
    );
  }
  if (!circle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <ScreenHeader />
        <EmptyState title={t('errors.generic')} />
      </View>
    );
  }

  const send = () => {
    const body = draft.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!body) {
      return;
    }
    update((s) => ({
      ...s,
      localMessages: {
        ...s.localMessages,
        [circle.id]: [
          ...(s.localMessages[circle.id] ?? []),
          { id: `local-${Date.now().toString(36)}`, body, sentAt: new Date().toISOString() },
        ],
      },
    }));
    setDraft('');
  };

  const memberName = (memberId: string) =>
    memberId === DEMO_SELF_ID
      ? t('connect.you')
      : (circle.members.find((m) => m.id === memberId)?.displayName ?? '');

  const openActions = (message: CircleMessage) => {
    if (message.authorId === DEMO_SELF_ID) {
      return;
    }
    Alert.alert(t('connect.messageActions'), undefined, [
      {
        text: t('connect.report'),
        onPress: () => Alert.alert(t('connect.report'), t('connect.reportDone')),
      },
      {
        text: t('connect.block'),
        style: 'destructive',
        onPress: () => Alert.alert(t('connect.block'), t('connect.blockDone')),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const composer = (
    <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.xs }]}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={t('connect.messagePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={t('connect.messagePlaceholder')}
        maxLength={MAX_MESSAGE_LENGTH}
        multiline
        style={[styles.input, { fontFamily: fontFamily('regular') }]}
        testID="message-input"
      />
      <SpringPressable
        accessibilityRole="button"
        accessibilityLabel={t('connect.send')}
        accessibilityState={{ disabled: !draft.trim() }}
        disabled={!draft.trim()}
        onPress={send}
        haptic="light"
        pressedScale={0.9}
        style={[styles.send, !draft.trim() && styles.disabled]}
        testID="send-message"
      >
        <Send size={20} color={colors.textOnAction} strokeWidth={1.75} />
      </SpringPressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DetailLayout
        heroTestID="circle-cover"
        hero={{ kind: 'type', tone: 'lilac', glyph: dropCap(circle.name) }}
        footer={composer}
      >
        <Enter index={0} after={100}>
          <Members circle={circle} memberName={memberName} />
        </Enter>
        {circle.challenge ? (
          <Enter index={1} after={100}>
            <Challenge circle={circle} memberName={memberName} />
          </Enter>
        ) : null}
        <View style={styles.conversation}>
          <AppText variant="title2" color="textBrand" accessibilityRole="header">
            {t('connect.conversation')}
          </AppText>
          <View style={styles.messages} accessibilityRole="list">
            {circle.messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                memberName={memberName}
                onLongPress={() => openActions(message)}
              />
            ))}
          </View>
          <AppText variant="caption" color="textSecondary" align="center">
            {t('connect.prototypeNote')}
          </AppText>
        </View>
      </DetailLayout>
    </KeyboardAvoidingView>
  );
}

/** "Private Circle", its name in serif, and who is in it, as monograms. */
function Members({ circle, memberName }: { circle: Circle; memberName: (id: string) => string }) {
  const { t } = useTranslation();
  const names = circle.members.map((member) => memberName(member.id));
  return (
    <View style={styles.header}>
      <View style={styles.kickerRow}>
        <AppText variant="kicker" color="textLink" style={styles.flex}>
          {t('connect.privateCircle')}
        </AppText>
        {circle.isPlaceholder ? <SampleBadge /> : null}
      </View>
      <AppText variant="display" color="textBrand" accessibilityRole="header">
        {circle.name}
      </AppText>
      <View
        style={styles.members}
        accessible
        accessibilityLabel={[t('connect.members', { count: circle.members.length }), ...names].join(
          ', ',
        )}
      >
        <View style={styles.seals}>
          {names.slice(0, 5).map((name, index) => (
            <View key={`${name}-${String(index)}`} style={index > 0 && styles.sealOverlap}>
              <Monogram name={name} size={40} />
            </View>
          ))}
        </View>
        <AppText variant="callout" color="textSecondary" style={styles.flex}>
          {t('connect.members', { count: circle.members.length })} · {names.join(', ')}
        </AppText>
      </View>
    </View>
  );
}

/**
 * The Circle's challenge: a fine thread per member that grows to their real
 * progress. Members who do not share their activity show a line of text
 * instead, never a guess.
 */
function Challenge({ circle, memberName }: { circle: Circle; memberName: (id: string) => string }) {
  const { t } = useTranslation();
  const challenge = circle.challenge;
  if (!challenge) {
    return null;
  }
  return (
    <View style={styles.challenge}>
      <View style={styles.challengeHeader}>
        <LotusIcon size={18} color={colors.textLink} />
        <AppText variant="kicker" color="textLink">
          {t('connect.challenge')}
        </AppText>
      </View>
      <AppText variant="title2" color="textBrand">
        {challenge.title}
      </AppText>
      {circle.members.map((member) => {
        const done = challenge.progress[member.id];
        const shared = member.sharesActivity && done !== undefined;
        return (
          <View key={member.id} style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <AppText variant="callout" weight="semibold" style={styles.flex} numberOfLines={1}>
                {memberName(member.id)}
              </AppText>
              <AppText variant="footnote" color="textSecondary">
                {shared
                  ? t('connect.challengeProgress', { done, target: challenge.targetSessions })
                  : t('connect.activityHidden')}
              </AppText>
            </View>
            {shared ? (
              <ProgressThread
                value={done / challenge.targetSessions}
                label={`${memberName(member.id)}, ${t('connect.challengeProgress', { done, target: challenge.targetSessions })}`}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function Message({
  message,
  memberName,
  onLongPress,
}: {
  message: CircleMessage;
  memberName: (id: string) => string;
  onLongPress: () => void;
}) {
  const { t } = useTranslation();
  const mine = message.authorId === DEMO_SELF_ID;

  if (message.kind === 'system') {
    // An event of the Circle, set between two fine rules.
    return (
      <View style={styles.system}>
        <View style={styles.systemRule} />
        <AppText variant="caption" color="textSecondary" align="center" style={styles.systemText}>
          {message.event === 'joined'
            ? t('connect.joined', { name: memberName(message.authorId) })
            : t('connect.challengeStarted')}
        </AppText>
        <View style={styles.systemRule} />
      </View>
    );
  }

  return (
    <Pressable
      onLongPress={onLongPress}
      accessibilityHint={mine ? undefined : t('connect.messageActions')}
      style={[styles.bubbleRow, mine && styles.bubbleRowMine]}
    >
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
        {!mine ? (
          <AppText variant="caption" color="textSecondary">
            {memberName(message.authorId)}
          </AppText>
        ) : null}
        {message.kind === 'text' ? (
          <AppText variant="body">{message.body}</AppText>
        ) : (
          <SharedClass classId={message.classId} />
        )}
      </View>
    </Pressable>
  );
}

function SharedClass({ classId }: { classId: string }) {
  const { t } = useTranslation();
  const { locale, formatLocale } = useLocaleSettings();
  const { data } = useClassDetail(classId);
  if (!data) {
    return null;
  }
  const title =
    resolveLocalizedText(data.session.title, locale, data.session.sourceLanguage)?.text ?? '';
  const when = classWhen(data.session, data.city, formatLocale);
  // A shared class, like a line of the timetable: its time in serif, what and where.
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={[
        t('connect.sharedClass'),
        title,
        `${when.date} ${when.time}`,
        data.organization.name,
      ].join(', ')}
      onPress={() => router.push(`/classes/${classId}`)}
      pressedScale={0.98}
      style={styles.shared}
      testID="shared-class"
    >
      <View style={styles.sharedTime}>
        <AppText variant="caption" weight="semibold" color="textLink" numberOfLines={1}>
          {when.date}
        </AppText>
        <AppText variant="title2" color="textBrand">
          {when.time}
        </AppText>
      </View>
      <View style={styles.flex}>
        <AppText variant="caption" color="textSecondary">
          {t('connect.sharedClass')}
        </AppText>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {data.organization.name}
        </AppText>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.xs,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  members: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  seals: {
    flexDirection: 'row',
  },
  // Monograms overlap a little, like seals laid side by side.
  sealOverlap: {
    marginStart: -10,
  },
  challenge: {
    gap: spacing.sm,
    padding: spacing.gutter,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  progressBlock: {
    gap: 0,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  conversation: {
    gap: spacing.md,
  },
  messages: {
    gap: spacing.sm,
  },
  system: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  systemRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderControl,
  },
  systemText: {
    flexShrink: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  // Soft bubbles, the corner nearest the author a little tighter.
  bubble: {
    maxWidth: '84%',
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  bubbleMine: {
    backgroundColor: colors.accentSoft,
    borderBottomEndRadius: radii.md,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    borderBottomStartRadius: radii.md,
  },
  shared: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxs,
    padding: spacing.sm,
    borderRadius: radii.lg + 6,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  sharedTime: {
    minWidth: 60,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  input: {
    flex: 1,
    minHeight: touchTarget.comfortable,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderControl,
    fontSize: 16,
    color: colors.textPrimary,
  },
  send: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radii.pill,
    backgroundColor: colors.actionPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
