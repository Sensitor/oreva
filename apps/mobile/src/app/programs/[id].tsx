import { useLocalSearchParams } from 'expo-router';
import { ProgramScreen } from '@/features/practice/ProgramScreen';

export default function ProgramRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProgramScreen id={String(id)} />;
}
