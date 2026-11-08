import { DEMO_SELF_ID, resolveLocalizedText, type Circle, type CircleMessage } from '@oreva/core';
import { colors, radii, spacing, touchTarget } from '@oreva/tokens';
import { router } from 'expo-router';
import { Send, Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClassDetail } from '@/data/hooks';
import { useLocaleSettings } from '@/i18n/I18nProvider';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, Avatar, Card, EmptyState, SampleBadge, ScreenHeader, Skeleton } from '@/ui';
import { useCircleView } from './useCircleView';

const MAX_MESSAGE_LENGTH = 1000;

/** A private Circle: members, challenge, conversation (Connect, P-13). */
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}>
        <ScreenHeader
          title={circle.name}
          trailing={circle.isPlaceholder ? <SampleBadge /> : undefined}
        />
        <Members circle={circle} memberName={memberName} />
        {circle.challenge ? <Challenge circle={circle} memberName={memberName} /> : null}
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
      </ScrollView>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('connect.send')}
          accessibilityState={{ disabled: !draft.trim() }}
          disabled={!draft.trim()}
          onPress={send}
          style={({ pressed }) => [
            styles.send,
            !draft.trim() && styles.disabled,
            pressed && styles.pressed,
          ]}
          testID="send-message"
        >
          <Send size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Members({ circle, memberName }: { circle: Circle; memberName: (id: string) => string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <AppText variant="footnote" color="textSecondary">
        {t('connect.members', { count: circle.members.length })}
      </AppText>
      <View style={styles.memberRow}>
        {circle.members.map((member, index) => (
          <View
            key={member.id}
            style={styles.member}
            accessible
            accessibilityLabel={memberName(member.id)}
          >
            <Avatar
              name={memberName(member.id)}
              size={44}
              tone={
                (['tileViolet', 'tileMint', 'tileOrchid', 'backgroundTint'] as const)[index % 4]
              }
            />
            <AppText variant="caption" numberOfLines={1}>
              {memberName(member.id)}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function Challenge({ circle, memberName }: { circle: Circle; memberName: (id: string) => string }) {
  const { t } = useTranslation();
  const challenge = circle.challenge;
  if (!challenge) {
    return null;
  }
  return (
    <Card tone="tileMint" style={styles.challenge}>
      <View style={styles.challengeHeader}>
        <Trophy size={20} color={colors.textPrimary} strokeWidth={1.75} />
        <AppText variant="footnote" color="textOnPastelSecondary">
          {t('connect.challenge')}
        </AppText>
      </View>
      <AppText variant="headline">{challenge.title}</AppText>
      {circle.members.map((member) => {
        const done = challenge.progress[member.id];
        return (
          <View key={member.id} style={styles.progressRow}>
            <AppText variant="callout" style={styles.progressName} numberOfLines={1}>
              {memberName(member.id)}
            </AppText>
            {member.sharesActivity && done !== undefined ? (
              <View
                style={styles.progressTrack}
                accessible
                accessibilityLabel={`${memberName(member.id)}, ${t('connect.challengeProgress', { done, target: challenge.targetSessions })}`}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (done / challenge.targetSessions) * 100)}%` },
                  ]}
                />
              </View>
            ) : (
              <AppText variant="footnote" color="textOnPastelSecondary" style={styles.flex}>
                {t('connect.activityHidden')}
              </AppText>
            )}
            {member.sharesActivity && done !== undefined ? (
              <AppText variant="footnote" color="textOnPastelSecondary">
                {t('connect.challengeProgress', { done, target: challenge.targetSessions })}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </Card>
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
    return (
      <AppText variant="footnote" color="textSecondary" align="center">
        {message.event === 'joined'
          ? t('connect.joined', { name: memberName(message.authorId) })
          : t('connect.challengeStarted')}
      </AppText>
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
  const { locale } = useLocaleSettings();
  const { data } = useClassDetail(classId);
  if (!data) {
    return null;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/classes/${classId}`)}
      style={styles.shared}
      testID="shared-class"
    >
      <AppText variant="caption" color="textSecondary">
        {t('connect.sharedClass')}
      </AppText>
      <AppText variant="bodyStrong">
        {resolveLocalizedText(data.session.title, locale, data.session.sourceLanguage)?.text}
      </AppText>
      <AppText variant="footnote" color="textSecondary">
        {data.organization.name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  member: {
    alignItems: 'center',
    gap: 2,
    width: 56,
  },
  challenge: {
    gap: spacing.xs,
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
  progressName: {
    width: 72,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: radii.pill,
  },
  flex: {
    flex: 1,
  },
  messages: {
    gap: spacing.xs,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  bubbleMine: {
    backgroundColor: colors.accentSoft,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
  },
  shared: {
    gap: 2,
    padding: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.backgroundTint,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  input: {
    flex: 1,
    minHeight: touchTarget.comfortable,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    fontSize: 16,
    color: colors.textPrimary,
  },
  send: {
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
