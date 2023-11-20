import { useEffect } from 'react';

import {
  SettingsScreen,
  SettingsForm,
  ConnectionForm,
  DevicesForm
} from '../src/screens/SettingsScreen';
import { useStore } from '../src/store/Context';
import { View } from 'react-native';

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
  devices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => ({
    deviceId: `${i}`,
    label: `Audio${i}`
  })),
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

  return (
    <View style={{ height: 480, width: 340 }}>
      <SettingsScreen {...args} />
    </View>
  );
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

export const Devicesform = args => (
  <View style={{ height: 300, width: 300, backgroundColor: '#efefef' }}>
    <DevicesForm {...args} />
  </View>
);
Devicesform.args = {
  ...settingsMock,
  onChange: values => console.log(values)
};
