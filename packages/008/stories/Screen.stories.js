import { useState } from 'react';
import { Button, View } from 'react-native';

import { Screen } from '../src/screens/Screen';
import { Text } from '../src/components/Basics';

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

export const OverlayTest = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View
      style={{
        width: 350,
        height: 500,
      }}
    >
      <Screen visible={true} color="#00ff00">
        <Text>Im screen one. You found me!</Text>
      </Screen>

      <Screen
        visible={isVisible}
        closeable
        onClose={() => setIsVisible(false)}
      >
        <Text>Close me</Text>
      </Screen>
    </View>
  );
};
