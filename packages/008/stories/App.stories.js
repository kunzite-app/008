import { useEffect } from 'react';

import App from '../App';
import { useStore } from '../src/store/Context';

export default {
  title: 'Screens/Application',
  component: App,
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default = () => <App />;

export const Notlogged = () => {
  const store = useStore();

  useEffect(() => {
    store.setSettings({
      settingsUri: 'http://test.com/settings'
    });
  }, []);

  return <App />;
};

export const WithSipParams = () => {
  const store = useStore();

  useEffect(() => {
    store.setSettings({
      sipUri: 'http://test.com/sip',
      sipPassword: '1234',
      wsUri: 'http://test.com/ws'
    });
  }, []);

  return <App />;
};
