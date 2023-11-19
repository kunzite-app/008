import { View } from 'react-native';

import { init } from '../Electron';
import { COLORS } from './Basics';

import { init as initEvents } from '../Events';
import { useStore } from '../store/Context';

init();
initEvents();

export const Container = ({ children }) => {
  const {
    size: { width, height }
  } = useStore();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backColor
      }}
    >
      <View style={{ width, height, backgroundColor: COLORS.app }}>
        {children}
      </View>
    </View>
  );
};
