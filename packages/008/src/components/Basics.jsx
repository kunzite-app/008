import React from 'react';
import { 
  ActivityIndicator,
  Image,  
  Text as RNText, 
  TextInput as RNTextInput, 
  TouchableOpacity, 
  View, 
} from 'react-native';

import {
  CheckIcon,
  ClockIcon,
  DeleteIcon,
  GridIcon,
  HeadphonesIcon,
  MicOffIcon,
  PauseIcon,
  PhoneForwardedIcon,
  PhoneIcon,
  PlayIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  XIcon,
  TrashIcon,
  Share2Icon,
  PlusIcon,
  VideoIcon,
  ChevronIcon,
  PhoneOffIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon
} from './Icons';

import SelectDropdown from 'react-native-select-dropdown';

const fontFamily = 'Roboto Flex';

export const COLORS = {
  primary: '#0061a6',
  warning: '#fec514',
  danger: '#C41818',
  success: '#3CA82E',
  secondary: '#3CA82E',
  borderColor: '#E2E6F0',
  backColor: '#F7F7F7',
  app: '#ffffff'
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
  <RNTextInput style={[{ fontFamily, outlineStyle: 'none' }, props.disabled ? { backgroundColor: BACKCOLOR } : {}, style ]} {...props} />

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
      style={[{ ...defaultStyle, placeholderTextColor: BORDERCOLOR }, style]}
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
      dropdownStyle={{ height: options.length * 38, ...dropdownStyle }}
      renderDropdownIcon={(opened) => renderDropdownIcon ? renderDropdownIcon(opened) : <ChevronIcon { ...iconStyle }/>}
    />

  )
}

export const Button = ({ children, color, style, onClick, fullWidth }) => {
  const calculatedColor = COLORS[color] || color;

  let stylex = { minWidth: 100, height: 40, borderRadius: 5, backgroundColor: calculatedColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', color: 'white' }
  if ( fullWidth ) stylex = { ...stylex, flex:1 }
  
  return (
    <TouchableOpacity 
      style={[ stylex, style ]}
      onPress={onClick} 
    >
      {children}
    </TouchableOpacity>
  )
};

export const ButtonIcon = ({ children, icon, iconType, onClick, style, size = 18, color = 'black' }) => {
  const styling = { size, color: COLORS[color] || color }
  const Icon = () => {
    if (icon === 'phoneForwarded') return <PhoneForwardedIcon { ...styling } />;
    if (icon === 'hang') return <PhoneOffIcon { ...styling } />;
    if (icon === 'micOff') return <MicOffIcon { ...styling } />;
    if (icon === 'play') return <PlayIcon { ...styling } />;
    if (icon === 'pause') return <PauseIcon { ...styling } />;
    if (icon === 'grid') return <GridIcon { ...styling } />;
    if (icon === 'clock') return <ClockIcon { ...styling } />;
    if (icon === 'users') return <UsersIcon { ...styling } />;
    if (icon === 'user') return <UserIcon { ...styling } />;
    if (icon === 'settings') return <SettingsIcon { ...styling } />;
    if (icon === 'headphones') return <HeadphonesIcon { ...styling }/>;
    if (icon === 'phone') return <PhoneIcon { ...styling } />;
    if (icon === 'delete') return <DeleteIcon { ...styling } />;
    if (icon === 'trash') return <TrashIcon { ...styling } />;
    if (icon === 'share2') return <Share2Icon { ...styling } />;
    if (icon === 'plus') return <PlusIcon { ...styling } />;
    if (icon === 'video') return <VideoIcon { ...styling } />;
    if (icon === 'check') return <CheckIcon { ...styling } />;
    if (icon === 'x') return <XIcon { ...styling } />;

    return iconType;
  }
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        style
      ]}
    >
      <Icon />
      {children}
    </TouchableOpacity>

  )
};

export const RoundIconButton = ({ size = 30, color, icon, iconSize, iconColor, onClick, style }) => {
  return (
  <View style={[{ 
    width: size,
    height: size,
    borderRadius: size / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color}, style]}>
    <ButtonIcon color={iconColor} icon={icon} size={iconSize} onClick={onClick} />
  </View>
  )
}

export const Link = ({ children, style = {}, onClick }) => (
  <TouchableOpacity onPress={() => onClick?.()}>
    <Text style={{ ...style }}>
      {children}
    </Text>
  </TouchableOpacity>
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

export const CancelAccept = ({ onCancel, onAccept }) => {
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
        <Button color="danger" onClick={onCancel} fullWidth={!onAccept}>
          <XIcon />
        </Button>
      )}

      {onAccept && (
        <Button color="secondary" onClick={onAccept} fullWidth={!onCancel}>
          <CheckIcon />
        </Button>
      )}
    </View>
  );
};

export const CancelAcceptCall = ({ onCancel, onAccept }) => {
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
          size={size}
          color={COLORS.danger}
          iconColor="white" 
          icon="phone"
          onClick={onCancel}
        />
      )}

      {onAccept && (
        <RoundIconButton
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

export const Avatar = ({ imageUrl, name, size = 35 }) => {
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

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text   
          numberOfLines={1} 
          ellipsizeMode='tail' 
          style={{ fontSize: size * 0.4 }}>
            {letters}
        </Text>
      )}
    </View>
    )
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

export const CallIcon = ({
  call,
  ...props
}) => {
  const { direction } = call;
  const color = props.color ? props.color : call.status === 'answered' ? undefined : COLORS.danger
  if (direction === 'inbound')
    return <PhoneIncomingIcon {...props} color={color} />;

  return <PhoneOutgoingIcon {...props} color={color} />;
};
