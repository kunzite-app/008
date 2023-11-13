import { TouchableOpacity, View } from 'react-native';

import { ContactAvatar, UserAvatar } from '../Avatars';
import { COLORS, Link, Select, Text } from '../Basics';
import { FormRow } from '../Forms';
import { PhoneIncomingIcon, PhoneOutgoingIcon } from '../Icons';
import Timer from '../Timer';

export const Numbers = ({ numbers, number, onChange }) => {
  if (!numbers.length) return

  const options = numbers.map(({ number, tags = [] }) => {
    return {
      label: number,
      value: number
    };
  });

  const needle = number || numbers[0].number;
  const { value } = options.find(({ value }) => value === needle);

  return (
    <Select
      tabIndex="-1"
      options={options}
      value={value}
      onChange={onChange}
      style={{ borderWidth: 0 }}
      buttonStyle={{ borderWidth: 0, height: 30 }}
      buttonTextStyle={{ textAlign: 'center', color: COLORS.primary, fontSize: 16 }}
      // rowTextStyle={{ textAlign: 'center' }}
      renderDropdownIcon={() => {}}
    />
  )
};

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

export const CallIcon = ({
  call,
  size = 12,
  color = call.status === 'answered' ? '#808080' : '#af231e'
}) => {
  const { direction } = call;

  if (direction === 'inbound')
    return <PhoneIncomingIcon size={size} color={color} />;

  return <PhoneOutgoingIcon size={size} color={color} />;
};

export const Header = ({
  numbers = [],
  number_out,
  onChange,

  onSettingsClick,
  avatar,
  status_color
}) => (
  <View style={{ flexDirection: 'row', paddingBottom: 5 }}>
    <View style={{ flex: 1 }}>
  </View>
    <View style={{ flex: 4 }}>
      <Numbers
        numbers={numbers}
        number={number_out}
        onChange={val => onChange?.(val)}
      />
    </View>

    <View
      tabIndex="-1"
      style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}
    >
      <TouchableOpacity
        onPress={onSettingsClick}
      >
        <UserAvatar avatar={avatar} color={status_color} />
    </TouchableOpacity>
    </View>
  </View>
);
