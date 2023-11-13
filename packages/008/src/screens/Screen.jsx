import { View } from 'react-native';

import { ButtonIcon } from '../components/Basics';

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
            <ButtonIcon  style={{ width: 30, padding: 5 }} onClick={() => onClose?.()} icon='x' size={20} />
          </View>
        )}

        <View style={[{ flex: 1 }, bodyStyle]}>{children}</View>
      </View>
    </View>
  );
}
