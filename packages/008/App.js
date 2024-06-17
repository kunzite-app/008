import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import {
  requestNotifications,
  request,
  PERMISSIONS,
} from 'react-native-permissions';

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import {
  AppInsightsErrorBoundary,
  ReactPlugin
} from '@microsoft/applicationinsights-react-js';

import { registerGlobals } from 'react-native-webrtc-web-shim';

import { COLORS, Button, Text } from './src/components/Basics';
import { Container } from './src/components/Container';
import { SettingsScreen } from './src/screens';
import { ContextProvider, useStore } from './src/store/Context';
import Phone from './src/components/Phone';

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      'InstrumentationKey=89ba4ad2-47ef-41e8-a151-4b3488132c63;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/',
    extensions: [reactPlugin]
  }
});
appInsights.loadAppInsights();
appInsights.trackPageView();

const requestPermissions = async () => {
  if (Platform.OS === 'web') {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
    } catch (err) {
      console.error('Failed obtaining audio/video permissions', err);
    }

    try {
      await Notification.requestPermission();
    } catch (err) {
      console.error('Failed obtaining Notification permissions', err);
    }

  } else {
    await requestNotifications(['alert', 'sound']);

    if (Platform.OS === 'ios') {
      await request(PERMISSIONS.IOS.MICROPHONE);
      await request(PERMISSIONS.IOS.CAMERA);
    } else {
      await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      await request(PERMISSIONS.ANDROID.CAMERA);

      await request(PERMISSIONS.ANDROID.READ_PHONE_STATE);
      await request(PERMISSIONS.ANDROID.CALL_PHONE);

      await request(PERMISSIONS.POST_NOTIFICATIONS);
    }
  }
};

export default function App() {
  const store = useStore();
  const { settingsUri, server, showSettings, toggleShowSettings } = store;

  useEffect(() => {
    registerGlobals();
    requestPermissions();
  }, []);

  useEffect(() => {
    const mustSettings = !settingsUri;
    if (mustSettings) toggleShowSettings(true, 'connection');
    else toggleShowSettings(false);
  }, [settingsUri]);

  return (
    <AppInsightsErrorBoundary
      onError={() => (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Button
            style={{ padding: 10 }}
            color={COLORS.primary}
            onClick={() => window?.location.reload()}
          >
            <Text style={{ color: 'white' }}>
              Something went wrong. Reload app.
            </Text>
          </Button>
        </View>
      )}
      appInsights={reactPlugin}
    >
      <ContextProvider>
        <Container>
          {!server && <Phone />}
          <SettingsScreen closeable={!server} visible={showSettings || server} />
        </Container>
      </ContextProvider>
    </AppInsightsErrorBoundary>
  );
}
