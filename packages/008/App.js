import _ from 'lodash';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import {
  AppInsightsErrorBoundary,
  ReactPlugin
} from '@microsoft/applicationinsights-react-js';

import { Button } from './src/components/Basics';
import { Container } from './src/components/Container';
import { LoginScreen, SettingsScreen, PhoneScreen } from './src/screens';
import { ContextProvider, useStore } from './src/store/Context';

import './src/SessionExtend';

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

export default function App() {
  const store = useStore();
  const {
    settingsUri,
    wsUri,
    sipUri,
    sipPassword,
    toggleShowLogin,
    toggleShowSettings
  } = store;

  useEffect(() => {
    const isOK = value => !_.isNil(value) && value.length;
    const isLoggable = isOK(wsUri) && isOK(sipUri) && isOK(sipPassword);

    const mustLogin = isOK(settingsUri) && !isLoggable;
    if (mustLogin) toggleShowLogin(true);
    else toggleShowLogin(false);

    const mustSettings = !settingsUri && !isLoggable;
    if (mustSettings) toggleShowSettings(true, 'connection');
    else toggleShowSettings(false);
  }, [settingsUri, wsUri, sipUri, sipPassword]);

  return (
    <AppInsightsErrorBoundary
      onError={() => (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Button onClick={() => window?.location.reload()}>
            Something went wrong. Please reload
          </Button>
        </View>
      )}
      appInsights={reactPlugin}
    >
      <ContextProvider>
        <Container>
          <PhoneScreen />
          <LoginScreen />
          <SettingsScreen />
        </Container>
      </ContextProvider>
    </AppInsightsErrorBoundary>
  );
}
