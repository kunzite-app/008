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
import { SettingsScreen, PhoneScreen } from './src/screens';
import { ContextProvider, useStore } from './src/store/Context';

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
  const { settingsUri, toggleShowSettings } = store;

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
          <SettingsScreen />
        </Container>
      </ContextProvider>
    </AppInsightsErrorBoundary>
  );
}
