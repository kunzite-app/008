import { useEffect } from 'react';

import {
  SettingsScreen,
  SettingsForm,
  ConnectionForm
} from '../src/screens/SettingsScreen';
import { useStore } from '../src/store/Context';

export default {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

const settingsMock = {
  statuses: [
    { value: 'online', text: 'Online', color: '#057e74' },
    { value: 'offline', text: 'Offline', color: '#A9A9A9' }
  ],
  devices: [
    { deviceId: '1', label: 'Audio1' },
    { deviceId: '2', label: 'Audio2' }
  ],
  status: 'offline',
  deviceId: '2',
  language: 'es'
};

const connectionMock = {
  settingsUri: 'http://test.com/settings',
  sipUri: 'http://test.com/sip',
  sipPassword: '1234',
  wsUri: 'http://test.com/ws'
};

export const Default = args => {
  const store = useStore();

  useEffect(() => {
    store.setSettings({ ...settingsMock, ...connectionMock });
    store.toggleShowSettings();
  }, []);

  return <SettingsScreen {...args} />;
};

Default.args = {
  onChange: values => console.log(values)
};

export const Settingsform = args => <SettingsForm {...args} />;
Settingsform.args = {
  ...settingsMock,
  onChange: values => console.log(values)
};

export const Connectionform = args => <ConnectionForm {...args} />;
Connectionform.args = {
  ...connectionMock,
  onChange: values => console.log(values)
};
