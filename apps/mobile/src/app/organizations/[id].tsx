import { useLocalSearchParams } from 'expo-router';
import { OrganizationScreen } from '@/features/discover/OrganizationScreen';

export default function OrganizationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrganizationScreen id={String(id)} />;
}
