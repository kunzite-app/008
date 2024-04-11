import { View } from 'react-native';

import { COLORS } from './Basics';
import { useStore } from '../store/Context';

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
