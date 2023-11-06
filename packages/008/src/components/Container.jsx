import { View } from 'react-native';

export const Container = ({ children }) => (
  <View style={{ flex: 1, backgroundColor: '#fff', padding: 10 }}>
    {children}
  </View>
);
