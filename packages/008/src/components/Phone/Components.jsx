import { TouchableOpacity, View } from 'react-native';

import { Avatar, COLORS, Select, Status, Text } from '../Basics';

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

  name,
  avatar,
  status_color,
  onSettingsClick,
}) => {
  const hasNumbers = numbers.length > 0;
  const avatarSize = 45;
  const numbersWidth = 200;

  const options = numbers.map(({ number }) => {
    return {
      label: number,
      value: number
    };  
  });

  const { value } = options.find(({ value }) => value === number_out) || options[0] || {};

  const itemFontStyle =  { fontSize: 16 };
  const backgroundColor = COLORS.backColor;

  return (
    <View style={{ justifyContent: 'center',  alignItems: 'center' }}>
      <View style={{ width: numbersWidth + avatarSize, flexDirection: 'row', alignItems: 'center', borderRadius: avatarSize / 2, backgroundColor }} >
        <TouchableOpacity onPress={onSettingsClick} >
          <UserAvatar avatar={avatar} color={status_color} size={avatarSize} />
        </TouchableOpacity>

        {!hasNumbers &&
          <Text numberOfLines={1} style={{ fontSize: 16, flex: 1, textAlign: 'center', paddingHorizontal: 5 }}>{name}</Text>
        }

        {hasNumbers &&
          <View style={{ justifyContent: 'center',  alignItems: 'center' }}>
            <Select
              key={value}
              tabIndex="-1"
              options={options}
              value={value}
              onChange={onChange}
              buttonStyle={{ borderWidth: 0, backgroundColor: '#0000', width: numbersWidth }}
              renderCustomizedButtonChild={(item) => { 
                return (
                <View>
                  <Text numberOfLines={1} style={{ fontSize: 16, flex: 1, textAlign: 'center', paddingHorizontal: 5 }}>{name}</Text>
                  <Text numberOfLines={1} style={{ ...itemFontStyle, color: COLORS.textSecondary, flex: 1, textAlign: 'center' }}>{item?.value}</Text>
                </View>
  )}
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
