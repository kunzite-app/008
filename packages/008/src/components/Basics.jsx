import { 
  ActivityIndicator,
  Image,  
  Text as RNText, 
  TextInput as RNTextInput, 
  Pressable, 
  View, 
  Switch as RNSwitch
} from 'react-native';

import {
  Icon as NIcon,
} from './Icons';

import SelectDropdown from 'react-native-select-dropdown';

const fontFamily = 'Roboto Flex';

export const COLORS = {
  primary: '#2D69AF',
  warning: '#fec514',
  danger: '#C41818',
  success: '#4DC418',
  secondary: '#4DC418',
  borderColor: '#E2E6F0',
  backColor: '#F7F7F7',
  app: '#ffffff',
  textPrimary: '#313131',
  textSecondary: '#6C6C6C'
}

export const BORDERCOLOR = COLORS.borderColor;
export const BACKCOLOR = COLORS.backColor;

const defaultStyle = { 
  padding: 10,
  height: 40,
  borderColor: BORDERCOLOR, 
  borderWidth: 1,
  fontFamily,
  borderRadius: 5
};

export const Text = ({ children, style, ...props }) => (
  <RNText style={[{ fontFamily }, style ]} {...props}>
    {children}
  </RNText>
)

export const TextInput = ({ style, ...props }) =>
  <RNTextInput 
    style={[{ fontFamily, color: COLORS.textPrimary, /* outlineStyle: 'none' */ }, props.disabled ? { backgroundColor: BACKCOLOR } : {}, style ]} 
      {...props} 
  />

export const TextField = ({
  onChange,
  onKeyPress,
  placeholder,
  style,
  password,
  ...props
}) => {

  return (
    <TextInput
      style={[{ ...defaultStyle, /* placeholderTextColor: BORDERCOLOR */ }, style]}
      onChangeText={onChange}
      secureTextEntry={password}
      {...props}
    />
  );
};

export const Select = ({ 
    value, 
    options, 
    onChange, 
    buttonStyle,
    buttonTextStyle,
    renderCustomizedButtonChild,
    rowStyle,
    rowTextStyle,
    renderCustomizedRowChild,
    dropdownStyle,
    renderDropdownIcon,
    iconStyle
  }) => {
  return (
    <SelectDropdown
      data={options}
      defaultValueByIndex={options.findIndex((item) => item.value === value ) || 0}
      onSelect={(item) => onChange?.(item.value)}
      buttonTextAfterSelection={({ label, text }) => label || text}
      rowTextForSelection={({ label, text }) => label || text}
      buttonStyle={{
        // flex: 1,
        height: 40,
        width: '100%',
        backgroundColor: COLORS.app,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BORDERCOLOR,
        ...buttonStyle
      }}
      buttonTextStyle={{ color: '#000', textAlign: 'left', fontSize: 14, fontFamily, ...buttonTextStyle }}
      renderCustomizedButtonChild={renderCustomizedButtonChild}
      rowStyle={{ padding: 5, paddingVertical: 10, borderBottomColor: BORDERCOLOR, ...rowStyle }}
      rowTextStyle={{ textAlign: 'left', fontSize: 14, fontFamily, ...rowTextStyle }}
      renderCustomizedRowChild={renderCustomizedRowChild}
      dropdownStyle={dropdownStyle}
      renderDropdownIcon={(opened) => renderDropdownIcon ? renderDropdownIcon(opened) : <Icon icon="chevron-down" { ...iconStyle }/>}
    />

  )
}

export const Switch = (props) =>  <RNSwitch activeTrackColor={COLORS.borderColor} activeThumbColor={COLORS.primary} {...props} />;

export const Button = ({ children, color, style, onClick, fullWidth, testID }) => {
  const calculatedColor = COLORS[color] || color;

  let stylex = { minWidth: 100, height: 40, borderRadius: 5, backgroundColor: calculatedColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', color: 'white' }
  if ( fullWidth ) stylex = { ...stylex, flex:1 }
  
  return (
    <Pressable 
      testID={testID}
      style={[ stylex, style ]}
      onPress={onClick} 
    >
      {children}
    </Pressable>
  )
};

export const Icon = ({ icon, size, color = COLORS.textPrimary }) => {
  const styling = { icon, size, color: COLORS[color] || color }
  return <NIcon {...styling} />
}

export const CallIcon = ({
  call = {},
  ...props
}) => {
  const { direction } = call;
  const color = props.color ? props.color : call.status === 'answered' ? COLORS.textSecondary : COLORS.danger
  if (direction === 'inbound')
    return <Icon icon="phone-incoming" {...props} color={color} />;

  return <Icon icon="phone-outgoing"  {...props} color={color} />;
};

export const ButtonIcon = ({ children, icon, onClick, style, color, testID, size = 18 }) => {
  return (
    <Pressable
      testID={testID}
      onPress={onClick}
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        style
      ]}
    >
      { icon && <Icon {...{icon, size, color }} />}
      {children}
    </Pressable>
  )
};

export const RoundIconButton = ({ size = 30, color, iconSize, iconColor, style, ...props }) => {
  return (
    <ButtonIcon 
      {...props}
      color={iconColor} 
      size={iconSize} 
      style={[{ 
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color}, style]}
    />
  )
}

export const Link = ({ children, style = {}, onClick }) => (
  <Pressable onPress={() => onClick?.()}>
    <Text style={{ ...style }}>{children}</Text>
  </Pressable>
);

export const Loader = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <ActivityIndicator size="large" />
  </View>
);

export const HRule = ({ color = BORDERCOLOR }) => (
  <View
    style={{
      marginVertical: 10,
      borderBottomWidth: 1,

      borderBottomColor: color
    }}
  />
);

export const CancelAccept = ({ onCancel, onAccept, acceptTestID, cancelTestID, }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {onCancel && (
        <Button testID={cancelTestID} color="danger" onClick={onCancel} fullWidth={!onAccept}>
           <Icon icon="x" color='white' />
        </Button>
      )}

      {onAccept && (
        <Button testID={acceptTestID} color="secondary" onClick={onAccept} fullWidth={!onCancel}>
           <Icon icon="check" color='white' />
        </Button>
      )}
    </View>
  );
};

export const CancelAcceptCall = ({ onCancel, onAccept, cancelTestID, acceptTestID }) => {
  const size = 50;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1
      }}
    >
      {onCancel && (
        <RoundIconButton
          testID={cancelTestID}
          size={size}
          color={COLORS.danger}
          iconColor="white" 
          icon="phone"
          onClick={onCancel}
        />
      )}

      {onAccept && (
        <RoundIconButton
          testID={acceptTestID}
          size={size}
          color={COLORS.secondary}
          iconColor="white" 
          icon="phone"
          onClick={onAccept}
        />
      )}
    </View>
  );
};

export const Avatar = ({ 
  source, 
  name = '', 
  size = 35 }) => {
  const letters = name.split(/\s+/g).map(chunk => chunk[0]).join('').substring(0, 3).toUpperCase();
  
  const stringToHslColor = (str, s, l) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const h = hash % 360;
    return 'hsl('+h+', '+s+'%, '+l+'%)';
  }

  return (
    <View style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: stringToHslColor(name, 30, 80),
      width: size, height: size, borderRadius: size / 2 
    }}>

      <Text   
        numberOfLines={1} 
        ellipsizeMode='tail' 
        style={{ fontSize: size * 0.4 }}>
          {letters}
      </Text>

      {source &&
      <Image source={source} 
        style={[{ width: size, height: size, borderRadius: size / 2 }, {position: 'absolute'}]} />
      }
    </View>
    )
};

const ImageAvatar = require('../../web/avatar.png');
export const AvatarContact = ({ contact = {}, ...props }) => {
  const { name, avatar } = contact;

  return (
    <Avatar
      {...props}
      name={name}
      source={avatar?.length > 0 ? { uri: avatar } : name ? undefined : ImageAvatar}
    />
  );
};

export const AvatarUser = ({
  color,
  avatar,
  ...props
}) => {
  return (
    <View>
      <Avatar size={50} {...props} source={avatar ? { uri: avatar } : ImageAvatar} />
      <Status color={color} size={12} style={{ position: 'absolute', bottom: 0, right: 0 }} />
    </View>
  );
};

export const Status = ({ color, size = 10, style }) => {
  const roundstyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color || 'black'
  };

  return <View style={{ ...style, ...roundstyle }} />;
};

export const FormRow = ({ children, label, style = {} }) => (
  <View style={{ width: '100%', paddingVertical: 10, ...style }}>
    {label && (
      <Text style={{ paddingBottom: 5, fontSize: 12, fontWeight: 500 }}>
        {label}
      </Text>
    )}
    {children}
  </View>
);

export const InputRow = ({ label, ...rest }) => (
  <FormRow label={label}>
    <TextField testID={label} {...rest} />
  </FormRow>
);
