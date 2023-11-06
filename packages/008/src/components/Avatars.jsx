import { View } from 'react-native';

import { Avatar } from './Basics';

export const Status = ({ color, size = 10, style }) => {
  const roundstyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color || 'black'
  };

  return <View style={{ ...style, ...roundstyle }} />;
};

export const UserAvatar = ({
  color,
  avatar,
  size = 'm',
  defaultImageUrl = 'avatar.png'
}) => {
  return (
    <View>
      <Avatar name="" size={size} imageUrl={avatar || defaultImageUrl} />
      <Status
        color={color}
        size={12}
        style={{ position: 'absolute', bottom: 0, right: 0 }}
      />
    </View>
  );
};

export const ContactAvatar = ({
  contact = {},
  size = 'm',
  defaultImageUrl = 'avatar.png'
}) => {
  const { name, avatar } = contact;

  return (
    <Avatar
      size={size}
      name={name || 'Unknown'}
      imageUrl={avatar || (name ? undefined : defaultImageUrl)}
    />
  );
};
