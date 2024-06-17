import { Platform, View } from 'react-native';

import { COLORS } from './Basics';
import { useStore } from '../store/Context';

export const Container = ({ children }) => {
  const { size } = useStore();

  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.backColor
        }}
      >
        <View style={{ ...size, backgroundColor: COLORS.app }}>
          {children}
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.app }}>
      {children}
    </View>
  )
};
