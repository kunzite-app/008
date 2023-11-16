import { TouchableOpacity, View } from 'react-native';

import { ContactAvatar } from '../Avatars';
import { Avatar, COLORS, Link, Select, Status, Text } from '../Basics';
import { FormRow } from '../Forms';
import Timer from '../Timer';
import { PhoneIncomingIcon, PhoneOutgoingIcon } from '../Icons';


export const CallInfo = ({ inbound, number = '', timer = false }) => {
  const [extension] = number.split('@');

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#ffffff80',
        
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.25)",

        // iOS shadow properties
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        // Android shadow property
        elevation: 5,
      }}
    >
      <Text style={{ fontSize: 16, paddingTop: 5, paddingRight: 10 }}>
        {inbound ? <PhoneIncomingIcon /> : <PhoneOutgoingIcon />}
      </Text>

      <Text numberOfLines={1} style={{ fontSize: 16 }}>
        {extension}
      </Text>

      <View style={{ justifyContent: 'flex-end', minWidth: 60 }}>
        {timer && <Timer />}
      </View>
    </View>
  );
};

export const ContactDetails = ({ contact = {}, number, onClick }) => {
  return (
    <View
      focusable={false}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <FormRow style={{ alignItems: 'center' }}>
        <ContactAvatar size={100} contact={contact} />
      </FormRow>

      {contact?.name &&
      <FormRow style={{ alignItems: 'center' }}>
        <Link onClick={() => onClick?.(contact)} style={{ fontSize: 22, paddingVertical: 10 }}>
          {contact.name}
        </Link>
      </FormRow>
      } 

      <FormRow style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>{number || contact?.phones?.[0] || ''}</Text>
      </FormRow>
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
  numbers = [],
  number_out,
  onChange,

  onSettingsClick,
  nickname = '-',
  avatar,
  status_color
}) => {
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
  const itemFontStyle =  { fontSize: 16, color: '#BABABA' };
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
                  <Text style={{ ...itemFontStyle, flex: 1, textAlign: 'center' }}>{item?.value}</Text>
                </View>
              }
              rowTextStyle={{ ...itemFontStyle, textAlign: 'center', backgroundColor, borderRadius: 8 }}
              dropdownStyle={{ margin: 10, height: options.length * 40, backgroundColor: '#fff', borderRadius: 8 }}
              // renderDropdownIcon={() => {}}
            />
          </View>
        }
      </View>
    </View>
  )
}
