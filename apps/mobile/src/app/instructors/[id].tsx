import { useLocalSearchParams } from 'expo-router';
import { InstructorScreen } from '@/features/discover/InstructorScreen';

export default function InstructorRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InstructorScreen id={String(id)} />;
}
