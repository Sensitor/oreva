import { useLocalSearchParams } from 'expo-router';
import { PlayerScreen } from '@/features/practice/PlayerScreen';

export default function PlayerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlayerScreen id={String(id)} />;
}
