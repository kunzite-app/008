import { TouchableOpacity, View } from 'react-native';

import { ContactAvatar } from '../Avatars';
import { Avatar, COLORS, Link, Select, Status, Text } from '../Basics';

export const ContactDetails = ({ contact = {}, number, onClick }) => {
  const displayedNumber = number || contact?.phones?.[0] || '';
  
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      focusable={false}
    >
      <ContactAvatar size={100} contact={contact} />
      {contact?.name &&
        <Link onClick={() => onClick?.(contact)} style={{ fontSize: 22, paddingVertical: 10 }}>
          {contact.name}
        </Link>
      } 

      <Text style={{ fontSize: 20 }}>{displayedNumber}</Text>
    </View>
  );
};

export const UserAvatar = ({
  color,
  avatar,
  size = 50,
  defaultImageUrl = 'avatar.png'
}) => {
  return (
    <View width={size} height={size}>
      <Avatar name="" size={size} imageUrl={avatar || defaultImageUrl} />
      <Status color={color} size={12} style={{ position: 'absolute', bottom: 0, right: 0 }} />
    </View>
  );
};

export const Header = ({
  // numbers = [],
  number_out,
  onChange,

  onSettingsClick,
  // nickname = '-',
  // avatar,
  status_color
}) => {
  const numbers = []
  const avatar  = '';
  const nickname = '-';

  const hasNumbers = numbers.length >0;
  const avatarSize = 45;
  const numbersWidth = hasNumbers ? 200 : 0;

  const options = numbers.map(({ number }) => {
    return {
      label: number,
      value: number
    };  
  });

  const needle = number_out || numbers?.[0]?.number;
  const { value } = options.find(({ value }) => value === needle) || {};
  const itemFontStyle =  { fontSize: 16 };
  const backgroundColor = COLORS.backColor;

  return (
    <View style={{ justifyContent: 'center',  alignItems: 'center' }}>
      <View style={{ width: numbersWidth + avatarSize, flexDirection: 'row', alignItems: 'center', borderRadius: avatarSize / 2, backgroundColor }} >
        <TouchableOpacity onPress={onSettingsClick} >
          <UserAvatar avatar={avatar} color={status_color} size={avatarSize} />
        </TouchableOpacity>

        {hasNumbers &&
          <View style={{ justifyContent: 'center',  alignItems: 'center' }}>
            <Select
              tabIndex="-1"
              options={options}
              value={value}
              onChange={onChange}
              buttonStyle={{ borderWidth: 0, backgroundColor: '#0000', width: numbersWidth }}
              renderCustomizedButtonChild={(item) =>
                <View>
                  <Text style={{ fontSize: 16, flex: 1, textAlign: 'center' }}>{nickname}</Text>
                  <Text style={{ ...itemFontStyle, color: '#BABABA', flex: 1, textAlign: 'center' }}>{item?.value}</Text>
                </View>
              }
              rowTextStyle={{ ...itemFontStyle, textAlign: 'center', backgroundColor, borderRadius: 8, padding: 5 }}
              dropdownStyle={{ margin: 10, height: options.length * 50, backgroundColor: '#fff', borderRadius: 8 }}
              // renderDropdownIcon={() => {}}
            />
          </View>
        }
      </View>
    </View>
  )
}
