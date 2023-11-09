import {
  EuiAvatar,
  EuiFieldPassword,
  EuiFieldText,
  EuiSelect,
  EuiButton,
  EuiButtonIcon,
  EuiPanel,
  EuiComboBox
} from '@elastic/eui';
import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

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

import '@elastic/eui/dist/eui_theme_light.css';

const fontFamily = 'Roboto Flex';

export const Link = ({ children, style = {}, onClick }) => (
  <TouchableOpacity onPress={() => onClick?.()}>
    <Text style={{ fontFamily, textDecorationLine: 'underline', ...style }}>
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

export const HRule = ({ color = '#D3DAE6' }) => (
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
        alignItems: 'center'
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

/* ElasticUI */

export const Button = ({ children, ...props }) => {
  return <EuiButton {...props}>{children}</EuiButton>;
};

export const ButtonIcon = ({ icon, iconType, ...props }) => {
  return (
    <EuiButtonIcon
      aria-label={icon || 'none'}
      tabIndex="-1"
      iconType={
        iconType ||
        (() => {
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

          return null;
        })
      }
      {...props}
      isSelected={false}
    />
  );
};

export const FieldText = ({
  value,
  onChange,
  onKeyPress,
  placeholder,
  password,
  style,
  ...rest
}) => {
  if (password)
    return (
      <EuiFieldPassword
        {...rest}
        value={value}
        placeholder={placeholder}
        onKeyPress={e => onKeyPress?.(e.charCode)}
        onChange={e => onChange?.(e.target.value)}
        style={{ fontFamily, ...style }}
      />
    );

  return (
    <EuiFieldText
      {...rest}
      value={value}
      placeholder={placeholder}
      onKeyPress={e => onKeyPress?.(e.charCode)}
      onChange={e => onChange?.(e.target.value)}
      style={style}
    />
  );
};

export const Select = props => <EuiSelect tabIndex="-1" {...props} />;

export const Combobox = props => <EuiComboBox tabIndex="-1" {...props} />;

export const Panel = ({ children }) => (
  <EuiPanel paddingSize="s">{children}</EuiPanel>
);

export const Avatar = props => <EuiAvatar {...props} />;
