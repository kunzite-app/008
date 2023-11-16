import { Avatar } from './Basics';

export const ContactAvatar = ({
  contact = {},
  size = 35,
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
