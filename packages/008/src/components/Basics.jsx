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
  ChevronIcon
} from './Icons';

import SelectDropdown from 'react-native-select-dropdown';

const fontFamily = 'Roboto Flex';

const BORDERCOLOR = '#E2E6F0';
const BACKCOLOR = '#efefef';
export const COLORS = {
  primary: '#0061a6',
  warning: '#fec514',
  danger: '#b4251d',
  success: '#00726b',
  secondary: '#00726b'
}

const defaultStyle = { 
  padding: 5,
  height: 40,
  // backgroundColor: BACKCOLOR, 
  borderColor: BORDERCOLOR, 
  borderWidth: 1,
  fontFamily
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
    rowStyle,
    rowTextStyle,
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
        height: 40,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: BORDERCOLOR,
        ...buttonStyle
      }}
      buttonTextStyle={{ color: '#000', textAlign: 'left', fontSize: 16, fontFamily, ...buttonTextStyle }}
      rowStyle={{ padding: 5, paddingVertical: 15, borderBottomColor: BORDERCOLOR, ...rowStyle }}
      rowTextStyle={{ textAlign: 'left', fontSize: 16, fontFamily, ...rowTextStyle }}
      dropdownStyle={{ height: options.length * 50, borderBottomColor: BORDERCOLOR, ...dropdownStyle }}
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
  const styling = { size, color }
  const Icon = () => {
    if (icon === 'phoneForwarded') return <PhoneForwardedIcon { ...styling } />;
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

export const Link = ({ children, style = {}, onClick }) => (
  <TouchableOpacity onPress={() => onClick?.()}>
    <Text style={{ textDecorationLine: 'underline', ...style }}>
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
        paddingTop: 5,

        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1
      }}
    >
      {onCancel && (
        <Button fill color="danger" onClick={onCancel} fullWidth={!onAccept}>
          <XIcon />
        </Button>
      )}

      {onAccept && (
        <Button fill color="secondary" onClick={onAccept} fullWidth={!onCancel}>
          <CheckIcon />
        </Button>
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
        <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: 25 }} />
      ) : (
        <Text   
          numberOfLines={1} 
          ellipsizeMode='tail' 
          style={{ fontfontSize: size * 0.4 }}>{letters}</Text>
      )}
    </View>
    )
};
