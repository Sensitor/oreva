import { useLocalSearchParams } from 'expo-router';
import { CircleScreen } from '@/features/connect/CircleScreen';

export default function CircleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CircleScreen id={String(id)} />;
}
