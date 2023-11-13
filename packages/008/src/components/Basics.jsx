import React from 'react';
import { 
  ActivityIndicator,
  Image,  
  Text as RNText, 
  TextInput as RNTextInput, 
  TouchableOpacity, 
  View, 
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

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
  VideoIcon
} from './Icons';

const fontFamily = 'Roboto Flex';

const BORDERCOLOR = '#E2E6F0';
const BACKCOLOR = '#fbfcfd';
const COLORS = {
  primary: '#0061a6',
  warning: '#fec514',
  danger: '#b4251d',
  success: '#00726b',
  secondary: '#00726b'
}

const defaultStyle = { 
  padding: 8, 
  backgroundColor: BACKCOLOR, 
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
  <RNTextInput style={[{ fontFamily, outlineStyle: 'none' }, style ]} {...props} />

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

export const Select = ({ value, options, onChange, style, ...props }) => {
  return (
    <Picker 
      { ...props }
      selectedValue={value} 
      onValueChange={onChange} 
      style={[{ ...defaultStyle }, style]}
      itemStyle = {{ fontSize: 20 }}
    >
      {options.map(({ label, text, value }) => <Picker.Item label={label || text} value={value} key={value} />)}
    </Picker>
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


export const ButtonIcon = ({ children, icon, iconType, onClick, style, size = 18 }) => {
  const Icon = () => {
    if (icon === 'phoneForwarded') return <PhoneForwardedIcon size={size} />;
    if (icon === 'micOff') return <MicOffIcon size={size} />;
    if (icon === 'play') return <PlayIcon size={size} />;
    if (icon === 'pause') return <PauseIcon size={size} />;
    if (icon === 'grid') return <GridIcon size={size} />;
    if (icon === 'clock') return <ClockIcon size={size} />;
    if (icon === 'users') return <UsersIcon size={size} />;
    if (icon === 'user') return <UserIcon size={size} />;
    if (icon === 'settings') return <SettingsIcon />;
    if (icon === 'headphones') return <HeadphonesIcon size={size}/>;
    if (icon === 'phone') return <PhoneIcon size={size} />;
    if (icon === 'delete') return <DeleteIcon size={size} />;
    if (icon === 'trash') return <TrashIcon size={size} />;
    if (icon === 'share2') return <Share2Icon size={size} />;
    if (icon === 'plus') return <PlusIcon size={size} />;
    if (icon === 'video') return <VideoIcon size={size} />;

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

export const Avatar = ({ imageUrl, name, size = 35 }) => (
  <View style={{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eeffee',
    width: size, height: size, borderRadius: size / 2 
  }}>

    {imageUrl ? (
      <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: 25 }} />
    ) : (
      <Text style={{ fontfontSize: size * 0.4 }}>{name?.[0]}</Text>
    )}
  </View>
);
