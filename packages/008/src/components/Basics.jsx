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
  <RNTextInput style={[{ fontFamily }, style ]} {...props} />

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


export const ButtonIcon = ({ children, icon, iconType, onClick, style }) => {
  const iconn = () => {
    if (icon === 'phoneForwarded') return <PhoneForwardedIcon />;
    if (icon === 'micOff') return <MicOffIcon />;
    if (icon === 'play') return <PlayIcon />;
    if (icon === 'pause') return <PauseIcon />;
    if (icon === 'grid') return <GridIcon />;
    if (icon === 'clock') return <ClockIcon />;
    if (icon === 'users') return <UsersIcon />;
    if (icon === 'user') return <UserIcon />;
    if (icon === 'settings') return <SettingsIcon />;
    if (icon === 'headphones') return <HeadphonesIcon />;
    if (icon === 'phone') return <PhoneIcon />;
    if (icon === 'delete') return <DeleteIcon />;
    if (icon === 'trash') return <TrashIcon />;
    if (icon === 'share2') return <Share2Icon />;
    if (icon === 'plus') return <PlusIcon />;
    if (icon === 'video') return <VideoIcon />;

    return iconType;
  }
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 1 },
        style
      ]}
    >
      {iconn()}
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
