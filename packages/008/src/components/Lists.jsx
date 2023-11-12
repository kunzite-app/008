import moment from 'moment';
import React from 'react';
import { FiEyeOff, FiFile, FiSearch } from 'react-icons/fi';
import {
  ActivityIndicator,
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';

import { ContactAvatar } from './Avatars';
import { ButtonIcon, Text } from './Basics';
import { CallIcon } from './Phone/Components';
import { VideoIcon } from './Icons';

class NothingToShow extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FiEyeOff size="20px" color="gray" />
      </View>
    );
  }
}

class CdrCell extends React.Component {
  render = () => {
    const { cdr = {}, onClick, lang = 'en' } = this.props;
    const { direction, from, to, date, contact = {}, video } = cdr;
    const destination = direction === 'inbound' ? from : to;

    const { name } = contact;
    const displayclient = name ? `${name} (${destination})` : destination;

    const callDate = moment(date).locale(lang).calendar({
      sameDay: 'LT',
      lastDay: `[${moment(date).calendar().split(' ')[0]}]`,
      lastWeek: 'dddd'
    });

    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', height: 40, paddingBottom: 10 }}
        onPress={() => onClick?.(destination, video)}
      >
        <View style={{ justifyContent: 'center', paddingRight: 10 }}>
          <CallIcon call={cdr} />
        </View>

        <View style={{ justifyContent: 'center', paddingRight: 10 }}>
          <ContactAvatar contact={cdr.contact} />
        </View>

        <View style={{ justifyContent: 'space-evenly' }}>
          <Text
            style={{ textAlign: 'left', fontSize: 12, color: '#353741' }}
            numberOfLines={1}
          >
            {displayclient}
          </Text>

          <Text style={{ textAlign: 'left', fontSize: 11, color: 'gray' }}>
            {callDate}
          </Text>
        </View>

        {video &&
        <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 10 }}>
          <VideoIcon />
        </View>
        }
      </TouchableOpacity>
    );
  };
}

class ContactCell extends React.Component {
  render() {
    const { contact = {}, onClick } = this.props;
    const { id, name } = contact;

    const isLocal = id.startsWith('cvf-');
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', height: 40, paddingBottom: 10 }}
        onPress={() => onClick?.(contact)}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {isLocal && <FiFile size={11} />}
        </View>

        <View style={{ flex: 2, justifyContent: 'center' }}>
          <ContactAvatar contact={contact} />
        </View>

        <View style={{ flex: 7, justifyContent: 'center' }}>
          <Text
            style={{ textAlign: 'left', fontSize: 12, color: '#353741' }}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

class WebhookCell extends React.Component {
  render() {
    const { webhook, onClick, onDeleteClick } = this.props;
    const { label, endpoint } = webhook;

    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', minHeight: 40, paddingBottom: 10 }}
        onPress={() => onClick?.(webhook)}
      >
        <View style={{ flex: 7, justifyContent: 'space-evenly' }}>
          <Text
            style={{ textAlign: 'left', fontSize: 12, color: '#353741' }}
            numberOfLines={1}
          >
            {label}
          </Text>

          <Text style={{ textAlign: 'left', fontSize: 11, color: 'gray' }}>
            {endpoint}
          </Text>
        </View>

        <ButtonIcon
          icon="trash"
          color="danger"
          onClick={() => onDeleteClick?.(webhook)}
        />
      </TouchableOpacity>
    );
  }
}

const SearchInput = ({ onChange, value, style }) => (
  <View style={{ flexDirection: 'row', alignItems: 'bottom', ...style }}>
    <View style={{ borderBottomWidth: 1, width: 30 }}>
      <FiSearch />
    </View>

    <TextInput
      style={{ flex: 1, borderBottomWidth: 1 }}
      onChangeText={text => onChange?.(text)}
      value={value}
    />
  </View>
);

class List extends React.Component {
  state = {};

  render_cell({ item }) {
    throw new Error('Not yet implemented');
  }

  render() {
    const {
      data = [],
      showFilter,
      onChangeFilter,
      filterVal,
      maxItems = 500,
      total,
      loading
    } = this.props;

    return (
      <View style={{ flex: 1, padding: 10 }}>
        {showFilter && (
          <SearchInput
            value={filterVal}
            style={{ paddingVertical: 10 }}
            onChange={onChangeFilter}
          />
        )}

        {data?.length > 0 && (
          <FlatList
            style={{ flex: 1 }}
            data={data.slice(0, maxItems)}
            renderItem={this.render_cell.bind(this)}
            keyExtractor={item => item.id || item.name}
            contentContainerStyle={{ paddingTop: 10, paddingLeft: 5 }}
          />
        )}

        {!data?.length && <NothingToShow />}

        <View
          style={{ paddingTop: 10, flexDirection: 'row', alignItems: 'bottom' }}
        >
          {loading && <ActivityIndicator />}

          {data?.length > maxItems && (
            <Text
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 12,
              }}
            >
              {maxItems} / {total || data.length}
            </Text>
          )}
        </View>
      </View>
    );
  }
}

export class CdrsList extends List {
  render_cell({ item: cdr }) {
    const { onClick } = this.props;
    return <CdrCell cdr={cdr} onClick={onClick} key={cdr.id} />;
  }
}

export class ContactsList extends List {
  render_cell({ item: contact }) {
    const { onClick } = this.props;
    return <ContactCell contact={contact} onClick={onClick} key={contact.id} />;
  }
}

export class WebhooksList extends List {
  render_cell({ item: webhook }) {
    const { onClick, onDeleteClick } = this.props;
    return (
      <WebhookCell
        webhook={webhook}
        onClick={onClick}
        onDeleteClick={onDeleteClick}
        key={webhook.id}
      />
    );
  }
}
