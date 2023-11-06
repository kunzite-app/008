import { TouchableOpacity, Modal, View } from 'react-native';

import { XIcon } from '../components/Icons';

export const Screen = ({
  children,
  color,
  headerStyle,
  bodyStyle,
  onClose,
  closeable,
  style,
  visible,
  ...rest
}) => {
  if (!visible) return
  return (
    <View style={[{ height: '100%', width: '100%', position: 'absolute', backgroundColor: '#fff'}, style]} {...rest}>
      <View style={[{ flex: 1, backgroundColor: color }]}>
        {closeable && (
          <View style={[{ direction: 'RTL', height: 30 }, headerStyle]}>
            <TouchableOpacity
              style={{ width: 32, padding: 5 }}
              onPress={() => onClose?.()}
            >
              <XIcon />
            </TouchableOpacity>
          </View>
        )}

        <View style={[{ flex: 1 }, bodyStyle]}>{children}</View>
      </View>
    </View>
  );
}
