import moment from 'moment';
import React from 'react';
import {
  View,
  TouchableOpacity,
  FlatList
} from 'react-native';

import { ContactAvatar } from './Avatars';
import { BORDERCOLOR, COLORS, CallIcon, Icon, Text, TextInput } from './Basics';
import { VideoIcon } from './Icons';

const PADDING = 10;
const CELL_HEIGHT = 40;
const SMALLFONT = 12;

const SearchInput = ({ onChange, value, style }) => (
  <View style={[
    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDERCOLOR, paddingBottom: PADDING, marginBottom: PADDING }, 
    style 
  ]}>
    <Icon icon='search' color={COLORS.textSecondary} />

    <TextInput
      style={{ flex: 1, marginLeft: 10 }}
      onChangeText={text => onChange?.(text)}
      value={value}
    />
  </View>
);

const List = ({
  data = [],
  renderItem,
  onChangeFilter,
  showFilter,
  filterVal,
  total,
  maxItems = 500,
  style
}) => (
  <View style={[{ flex: 1 }, style ]}>
    {showFilter && (
      <SearchInput
        value={filterVal}
        onChange={onChangeFilter}
      />
    )}

    {data?.length > 0 ? (
      <FlatList
        style={{ flex: 1 }}
        data={data.slice(0, maxItems)}
        renderItem={renderItem}
        keyExtractor={item => item.id || item.name}
      />
    ) : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={30} color={COLORS.textSecondary} icon='eye' />
      </View>
    )}

    {data?.length > maxItems && (
      <View
        style={{ flexDirection: 'row', alignItems: 'bottom', paddingBottom: PADDING }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: SMALLFONT,
            textAlign: 'right',
          }}
        >
          {maxItems} / {total || data.length}
        </Text>
      </View>
    )}
  </View>
)

const CdrCell = ({ cdr = {}, onClick, lang = 'en' }) => {
  const { direction, from, to, date, contact = {}, video } = cdr;
  const destination = direction === 'inbound' ? from : to;
  const { name } = contact;
  const displayName = name? `${name || ''} (${destination})` : destination;

  const callDate = moment(date).locale(lang).calendar({
    sameDay: 'LT',
    lastDay: `[${moment(date).calendar().split(' ')[0]}]`,
    lastWeek: 'dddd'
  });

  const subcellStyle = { justifyContent: 'center', marginRight: PADDING }
  return (
    <TouchableOpacity
      style={{ height: CELL_HEIGHT, marginVertical: PADDING / 2, flexDirection: 'row' }}
      onPress={() => onClick?.(destination, video)}
    >
      <View style={subcellStyle}>
        <ContactAvatar contact={cdr.contact} />
      </View>

      <View style={{ ...subcellStyle, flex: 1, justifyContent: 'space-evenly' }}>
        <Text numberOfLines={1}>
          {displayName}
        </Text>

        <Text style={{ fontSize: SMALLFONT, color: COLORS.textSecondary }} >
          {callDate}
        </Text>
      </View>

      {video &&
        <View style={subcellStyle}>
          <VideoIcon size={11} />
        </View>
      }
      <View style={subcellStyle}>
        <CallIcon call={cdr} size={14} />
      </View>
    </TouchableOpacity>
  );
}

const ContactCell = ({ contact = {}, onClick }) => (
  <TouchableOpacity
    style={{ height: CELL_HEIGHT, marginVertical: PADDING / 2, flexDirection: 'row' }}
    onPress={() => onClick?.(contact)}
  >
    <ContactAvatar contact={contact} />

    <View style={{ flex: 1, justifyContent: 'center', paddingLeft: PADDING }}>
      <Text numberOfLines={1} >{contact?.name || contact?.phones?.[0]}</Text>
    </View>
  </TouchableOpacity>
)

const WebhookCell = ({ webhook, onClick }) => {
  const { label, endpoint } = webhook;

  return (
    <TouchableOpacity
      style={{ height: CELL_HEIGHT, marginVertical: PADDING / 2, flexDirection: 'row' }}
      onPress={() => onClick?.(webhook)}
    >
      <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
        <Text numberOfLines={1} >{label || endpoint}</Text>

        <Text style={{ fontSize: SMALLFONT, color: COLORS.textSecondary }}>{endpoint}</Text>
      </View>
    </TouchableOpacity>
  );
}

const EventCell = ({ event }) => {
  const { type, data: { id, error } } = event;
  return (
    <View style={{ flex: 1, justifyContent: 'space-evenly', height: CELL_HEIGHT, marginVertical: PADDING  }}>
      <Text style={{ fontSize: SMALLFONT, color: error ? COLORS.danger : COLORS.primary }}>
        {JSON.stringify({ type, id, error })}
      </Text>
    </View>
  );
}

export const CdrsList = (props) => (
  <List {...props} renderItem={({ item }) =>
    <CdrCell cdr={item} onClick={props?.onClick} />} />
)

export const ContactsList = (props) => (
  <List {...props} renderItem={({ item }) =>
    <ContactCell contact={item} onClick={props?.onClick} />} />
)

export const WebhooksList = (props) => (
  <List {...props} renderItem={({ item }) =>
    <WebhookCell webhook={item} onClick={props?.onClick} />} />
)

export const EventsList = (props) => (
  <List {...props} renderItem={({ item }) =>
    <EventCell event={item} />} />
)
