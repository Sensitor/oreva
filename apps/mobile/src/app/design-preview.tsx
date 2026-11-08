import { Redirect } from 'expo-router';
import { isProduction } from '@/config/env';
import { DesignPreviewScreen } from '@/features/design-preview/DesignPreviewScreen';

export default function DesignPreviewRoute() {
  if (isProduction) {
    return <Redirect href="/" />;
  }
  return <DesignPreviewScreen />;
}
