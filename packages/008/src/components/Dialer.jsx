import { useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';

import Sound from '../Sound';
import { ButtonIcon, COLORS, RoundIconButton, Text, TextInput } from './Basics';
import { CdrsList, ContactsList } from './Lists';

const keys = [
  { keypad: '1', sub: '' },
  { keypad: '2', sub: 'ABC' },
  { keypad: '3', sub: 'DEF' },
  { keypad: '4', sub: 'GHI' },
  { keypad: '5', sub: 'JKL' },
  { keypad: '6', sub: 'MNO' },
  { keypad: '7', sub: 'PQRS' },
  { keypad: '8', sub: 'TUV' },
  { keypad: '9', sub: 'WXYZ' },
  { keypad: '*', sub: '' },
  { keypad: '0', sub: '+' },
  { keypad: '#', sub: '' }
];

const tones = {};
keys.forEach(async ({ keypad }) => {
  const key = keypad.replace('#', 'hash').replace('*', 'star');
  tones[keypad] = new Sound({ media: `dtmf/dtmf-${key}` });
});

const DialButton = ({ style, item, onPress, onLongPress }) => {
  const { keypad, sub } = item;
  return (
    <TouchableOpacity
      key={keypad}
      focusable={false}
      tabIndex="-1"
      style={[{
        justifyContent: 'center',
        alignItems: 'center',
      }, style]}
      onPress={() => {
        tones[keypad].play?.();
        onPress?.(keypad);
      }}
      onLongPress={() => {
        if (sub.length === 1) onLongPress?.(sub);
      }}
    >
      <Text style={{ fontSize: 18 }}>{keypad}</Text>
      <Text style={{ fontSize: 9 }}>{sub}</Text>
    </TouchableOpacity>
  );
};

export const DialGrid = ({ style, buttonStyle, ...events }) => (
  <View
    style={[{
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly'
    }, style]}
  >
    {keys.map((item, idx) => (
      <DialButton key={`dialbtn-${idx}`} item={item} {...events} style={[{ width: '33%' }, buttonStyle]} />
    ))}
  </View>
);

export const DialPad = ({ number = '', onClick, onClickVideo, isTransfer, style, testID }) => {
  const [value, setValue] = useState(number);

  useEffect(() => {
    setValue(number);
  }, [number]);

  const onPressDialer = data => setValue(value + data);
  const onPressDelete = () => setValue(value.substring(0, value.length - 1));
  
  const iconSize = 20;
  const buttonCallSize = 60;
  const cameraCallSize = 50;
  const appColor = COLORS.app;

  return (
    <View style={[{ flex: 1 }, style]}>
      <View 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderColor: COLORS.borderColor, borderBottomWidth: 1 }}
      >
        <TextInput
          style={{ flex: 1, fontSize: 18, textAlign: 'center' }}
          value={value}
          onChangeText={text => setValue(text)}
          testID={`${testID? testID : ''}dialerTextInput`}
        />
        <ButtonIcon icon="delete" onClick={onPressDelete} color='textSecondary' />
      </View>

      <DialGrid onPress={onPressDialer} onLongPress={onPressDialer} />

      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {!isTransfer &&
            <View>
              <RoundIconButton
                testID="callButton"
                size={buttonCallSize}
                color={COLORS.secondary}
                iconColor="white"
                icon="phone"
                iconSize={iconSize}
                onClick={() => onClick?.(value)} 
              />

              {onClickVideo &&
               <View style={{ alignItems: 'center', justifyContent: 'center', height: buttonCallSize, borderRadius: buttonCallSize / 2, position: 'absolute',  width: buttonCallSize - 5, left: buttonCallSize - 5, backgroundColor: appColor }}>
                  <RoundIconButton
                    testID="videoCallButton"
                    size={cameraCallSize}
                    color={COLORS.primary}
                    iconColor="white"
                    icon="video"
                    iconSize={iconSize}
                    onClick={() => onClickVideo?.(value)} 
                  />
                </View>
              }
            </View>
          }

          {isTransfer &&
            <ButtonIcon
              testID="transferButton"
              icon="phoneForwarded"
              size={iconSize}
              style={{ backgroundColor: COLORS.secondary, width: 50, height: 50, borderRadius: 30 }}
              color="white" 
              onClick={() => onClick?.(value)} 
            />
          }
        </View>
      </View>
    </View>
  );
};

const tabs = [
  { id: 'dialer', icon: 'grid' },
  { id: 'cdrs', icon: 'clock' },
  { id: 'contacts', icon: 'users' }
];

export const Dialer = ({
  number = '',
  onDialClick,
  onDialClickVideo,

  cdrs = [],
  onCdrClick,

  contacts = {},
  onContactClick,
  onContactsFilterChange,
  style,
  isTransfer,
  testID
}) => {
  const [tab, setTab] = useState('dialer');
  const [contactsFilter, setContactsFilter] = useState('');

  const contactsFilterChangeHandler = filter => {
    setContactsFilter(filter);
    onContactsFilterChange?.(filter);
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      {tab === 'dialer' && (
        <DialPad
          testID={testID}
          style={{ marginHorizontal: 40 }}
          onClick={onDialClick} 
          onClickVideo={onDialClickVideo} 
          number={number}
          isTransfer={isTransfer}
        />
      )}

      {tab === 'cdrs' && (
        <CdrsList 
          style={{ marginHorizontal: 20 }}
          data={cdrs} 
          onClick={(number, video) => onCdrClick?.(number, video)} 
        />
      )}

      {tab === 'contacts' && (
        <ContactsList
          style={{ marginHorizontal: 20 }}
          filterVal={contactsFilter}
          onChangeFilter={contactsFilterChangeHandler}
          showFilter
          data={contacts.hits}
          total={contacts.total}
          onClick={({ phones = [] }) => onContactClick?.(phones)}
        />
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          borderTopWidth: 1,
          borderColor: COLORS.borderColor,
          marginTop: 10
        }}
      >
        {tabs.map(({ id, icon }) => (
          <ButtonIcon
            style={{ height: 50, width: 50 }} 
            key={id} 
            color={tab === id ? COLORS.primary : COLORS.textPrimary}
            icon={icon} 
            onClick={() => setTab(id)} 
          />
        ))}
      </View>
    </View>
  );
};
