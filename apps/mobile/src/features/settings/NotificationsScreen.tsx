import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePrototypeStore } from '@/prototype/PrototypeStore';
import { AppText, ToggleRow } from '@/ui';
import { SettingsPage, settingsStyles } from './SettingsPage';

/** Notification preferences (cahier des charges 9). Saved on the phone until accounts exist. */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const { state, update } = usePrototypeStore();
  const set = (key: keyof typeof state.notifications) => (value: boolean) =>
    update((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));
  return (
    <SettingsPage title={t('profile2.notifications')}>
      <View style={settingsStyles.list}>
        <ToggleRow
          label={t('notificationsScreen.classReminders')}
          value={state.notifications.classReminders}
          onValueChange={set('classReminders')}
        />
        <ToggleRow
          label={t('notificationsScreen.classUpdates')}
          value={state.notifications.classUpdates}
          onValueChange={set('classUpdates')}
        />
        <ToggleRow
          label={t('notificationsScreen.circleMessages')}
          value={state.notifications.circleMessages}
          onValueChange={set('circleMessages')}
        />
        <ToggleRow
          label={t('notificationsScreen.news')}
          hint={t('notificationsScreen.newsHint')}
          value={state.notifications.news}
          onValueChange={set('news')}
          testID="toggle-news"
        />
      </View>
      <AppText variant="footnote" color="textSecondary">
        {t('notificationsScreen.deviceOnly')}
      </AppText>
    </SettingsPage>
  );
}
