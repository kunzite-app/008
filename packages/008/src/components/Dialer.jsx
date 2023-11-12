import { useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Button, ButtonIcon, Text, TextInput } from './Basics';
import { PhoneForwardedIcon, PhoneIcon, VideoIcon } from './Icons';
import Sound from '../Sound';
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

const DialButton = ({ keypad, sub, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      key={keypad}
      focusable={false}
      tabIndex="-1"
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '33%'
      }}
      onPress={() => {
        tones[keypad].play?.();
        onPress?.(keypad);
      }}
      onLongPress={() => {
        if (sub.length === 1) onLongPress?.(sub);
      }}
    >
      <Text
        focusable={false}
        tabIndex="-1"
        style={{ fontSize: 18 }}
      >
        {keypad}
      </Text>

      <Text focusable={false} tabIndex="-1" style={{ fontSize: 9 }}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
};

export const DialGrid = props => (
  <View
    style={[{
      width: '100%',
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly'
    }, props.style]}
  >
    {keys.map(item => (
      <DialButton key={item.keypad} {...props} {...item} />
    ))}
  </View>
);

export const DialPad = ({ number = '', onClick, onClickVideo, isTransfer }) => {
  const [value, setValue] = useState(number);

  useEffect(() => {
    setValue(number);
  }, [number]);

  const onPressDialer = data => setValue(value + data);
  const onPressDelete = () => setValue(value.substring(0, value.length - 1));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{
              fontSize: 18,
              textAlign: 'center',
              padding: 10
            }}
            value={value}
            onChangeText={text => setValue(text)}
          />
        </View>

        <ButtonIcon icon="delete" onClick={onPressDelete} />
      </View>

      <DialGrid onPress={onPressDialer} onLongPress={onPressDialer} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        <Button fill color="secondary" onClick={() => onClick?.(value)} style={{ flex: 3 }}>
          {isTransfer ? <PhoneForwardedIcon /> : <PhoneIcon />}
        </Button>

        {onClickVideo &&
          <View style={{ paddingLeft: 5 }}>
          <Button fill color="primary" onClick={() => onClickVideo?.(value)} style={{ flex: 1 }}>
            <VideoIcon />
          </Button>
          </View>
        }
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
  onContactsFilterChange
}) => {
  const [tab, setTab] = useState('dialer');
  const [contactsFilter, setContactsFilter] = useState('');

  const contactsFilterChangeHandler = filter => {
    setContactsFilter(filter);
    onContactsFilterChange?.(filter);
  };

  return (
    <View style={{ flex: 1 }}>
      {tab === 'dialer' && (
        <DialPad 
          onClick={onDialClick} 
          onClickVideo={onDialClickVideo} 
          number={number} />
      )}

      {tab === 'cdrs' && (
        <CdrsList data={cdrs} onClick={(number, video) => onCdrClick?.(number, video)} />
      )}

      {tab === 'contacts' && (
        <ContactsList
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
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        {tabs.map(({ id, icon }) => (
          <ButtonIcon key={id} icon={icon} onClick={() => setTab(id)} />
        ))}
      </View>
    </View>
  );
};
