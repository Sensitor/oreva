import { Redirect } from 'expo-router';
import { isProduction } from '@/config/env';
import { PrototypeScreen } from '@/features/settings/PrototypeScreen';

export default function PrototypeRoute() {
  if (isProduction) {
    return <Redirect href="/" />;
  }
  return <PrototypeScreen />;
}
