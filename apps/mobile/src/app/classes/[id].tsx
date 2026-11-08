import { useLocalSearchParams } from 'expo-router';
import { ClassDetailScreen } from '@/features/discover/ClassDetailScreen';

export default function ClassRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClassDetailScreen id={String(id)} />;
}
