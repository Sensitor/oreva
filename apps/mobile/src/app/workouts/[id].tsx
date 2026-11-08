import { useLocalSearchParams } from 'expo-router';
import { WorkoutScreen } from '@/features/practice/WorkoutScreen';

export default function WorkoutRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkoutScreen id={String(id)} />;
}
