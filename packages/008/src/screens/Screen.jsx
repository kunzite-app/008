import { View } from 'react-native';

import { ButtonIcon, COLORS } from '../components/Basics';

export const Screen = ({
  children,
  color = COLORS.app,
  bodyStyle,
  onClose,
  closeable,
  style,
  visible,
  ...rest
}) => {
  if (!visible) return
  
  return (
    <View style={[{ height: '100%', width: '100%', position: 'absolute', backgroundColor: color }, style]} {...rest}>
      
      {closeable && (
        <View style={[{ position: 'absolute', top: 5, right: 5, zIndex: 1000 }]}>
          <ButtonIcon size={20} onClick={() => onClose?.()} icon='x' />
        </View>
      )}

      <View style={[{ flex: 1 }, bodyStyle]}>
        {children}
      </View>
    </View>
  );
}
