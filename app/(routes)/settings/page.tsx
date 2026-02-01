import { Metadata } from 'next';
import SettingsPageClient from './SettingsPageClient';

export const metadata: Metadata = {
  title: 'Settings | FoxStream',
  description: 'Manage your preferences, sync settings, and provider configuration',
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
