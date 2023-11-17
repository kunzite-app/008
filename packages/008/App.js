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

import * as whisper from "whisper-webgpu";


const CACHE = {};
const infer = async ({ 
  url, 
  bin = 'base-q8g16.bin',
  data = 'tokenizer.json' }) => {

  const fetchBytes = async (url) => {
    if (!CACHE[url]) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      CACHE[url] = bytes
      console.log(`loaded ${url}`)
    }

    return CACHE[url];
  }

  const tokenizer = await fetchBytes(data);
  const model = await fetchBytes(bin);
  const audio = await fetchBytes(url);

  await whisper.default();
  const builder = new whisper.SessionBuilder();
  const session = await builder
    .setModel(model)
    .setTokenizer(tokenizer)
    .build();

  // const { segments } = await session.run(audio);

  const segments = [];
  await session.stream(audio, false, (segment) => {
    console.log(segment);
    segments.push(segments);
  });

  session.free();

  return segments
}

const yy = async () => {
  console.log(await infer({ url: 'carrental.wav' }));
  // console.log(await infer({ url: 'carrental.wav' }));
}
// yy();

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
