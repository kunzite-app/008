import { useEffect } from 'react';

import { LoginScreen } from '../src/screens';
import { useStore } from '../src/store/Context';

export default {
  title: 'Screens/LoginScreen',
  component: LoginScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default = args => {
  const store = useStore();

  useEffect(() => {
    store.toggleShowLogin();
  }, []);

  return <LoginScreen {...args} />;
};
