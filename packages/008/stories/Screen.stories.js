import { useState } from 'react';
import { Button, View } from 'react-native';

import { Screen } from '../src/screens/Screen';

export default {
  title: 'Screens/Screen',
  component: Screen,
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
      }}
    >
      <Button title="Open" onPress={() => setIsVisible(true)} />
      <Screen visible={isVisible} />
    </View>
  );
};

export const Closeable = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
      }}
    >
      <Button title="Open" onPress={() => setIsVisible(true)} />
      <Screen
        visible={isVisible}
        closeable
        onClose={() => setIsVisible(false)}
      />
    </View>
  );
};

export const Overlay = () => {
  const [isVisible, setIsVisible] = useState(false);

  setInterval(() => setIsVisible(true), 5000);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee'
      }}
    >
      <Button title="Open" onPress={() => setIsVisible(true)} />
      <Screen visible color="#00ff00" />
      <Screen
        visible={isVisible}
        closeable
        onClose={() => setIsVisible(false)}
      />
    </View>
  );
};
