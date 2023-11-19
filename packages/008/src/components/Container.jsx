import { View } from 'react-native';
import { COLORS } from './Basics';

export const Container = ({ children }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.app }}>
    {children}
  </View>
);
