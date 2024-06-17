import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Contacts from 'react-native-contacts';

import { VPhone } from './VPhone';
import { useStore } from './store';
import { Dialer } from '../components/Dialer';
import { Header } from '../components/Header';
import { useStore as useStoreContext } from '../store/Context';

import { Screen } from '../screens/Screen';
import { SessionScreen } from '../screens';

const requestContactsPermission = async () => {
  let result;
  if (Platform.OS === 'android') {
    result = await request(PERMISSIONS.ANDROID.READ_CONTACTS);
    
  } else if (Platform.OS === 'ios') {
    result = await request(PERMISSIONS.IOS.CONTACTS);
  }

  return result === RESULTS.GRANTED;
};

const noop = () => {};

const Phone = () => {
  const [ show_transfer, setShowtransfer ] = useState(false);

  const { 
    session,
    sessiont,
    
    network = true,

    avatar = 'https://avatars.githubusercontent.com/u/59776461',
    nickname = 'Demo',

    contacts = [],

    setState,

  } = useStore();
  
  const { 
    numbers = [
      {
        "number": "+1",
        "tags": ["Main"]
      }
    ], 
    number_out = '+1',

    statuses = [
      { "value": "online", "text": "Online", "color": "#057e74" },
      { "value": "offline", "text": "Offline", "color": "#A9A9A9" }
    ],
    status = 'online',

    // avatar = 'https://avatars.githubusercontent.com/u/59776461',
    // nickname = 'Demo',

    allowTransfer,
    allowBlindTransfer,
    allowVideo = true,

    cdrs, 

    // contacts,
    contactsFilter,
    setContactsDialerFilter
  } = {}  //useStoreContext();

  const setContacts = async () => {
    const permissionGranted = await requestContactsPermission();
    if (!permissionGranted)
      console.log('Contacts permission denied');
  
    const contacts = (await Contacts.getAll())
    .filter(contact => contact.phoneNumbers.length > 0)
    .map((contact) => {
      const { recordID: id, displayName: name, phoneNumbers, thumbnailPath } = contact;
      return { 
        id,
        name: name,
        phones: phoneNumbers.map(phone => phone.number),
        avatar: thumbnailPath?.length > 0 &&  thumbnailPath !== null ? thumbnailPath : undefined
      }
    })
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    setState({ contacts: { hits: contacts, total: contacts.length }});
  }

  
  useEffect(() => {
    VPhone.askPermissions();
    VPhone.register();

    setContacts();
  }, []);


  const { ua } = VPhone;

  const opts = { number: '633650984', extraHeaders: [`P-Asserted-Identity:${number_out}`, `x-Number:${number_out}`] }

  const { sip: { sipUri, sipUser }} = VPhone;
  const [sipUriName] = sipUri.replace('sip:', '').split('@');
  const displayName = nickname || sipUser || sipUriName || '';
  const onNumberChangeHandler = noop;

  const callHandler = async (number, video) => {
    await VPhone.call({ number, video });
  };

  const transferHandler = noop;
  const contactClickHandler = noop;
  const showTransferDialerHandler = async (blind = false) => {
    await session.hold();
    setShowtransfer(true);
    // this.setState({ show_transfer: true, show_blindTransfer: blind });
  };

  const noConnection = !ua?.isConnected() || !network;
    const status_color = statuses.find(
      item => item.value === (noConnection ? 'offline' : status)
    )?.color;

  return (
    <View style={{ flex: 1 }}>

      <View style={{ flex: 1, marginTop: 10 }}>
        <Header
          name={displayName}
          avatar={avatar}
          numbers={numbers}
          number_out={number_out}
          status_color={status_color}
          onChange={onNumberChangeHandler}
          // onSettingsClick={() => this.context.toggleShowSettings(true)}
          onSettingsClick={noop}
        />

        <Dialer
          style={{ marginTop: 25 }}
          key={session?.id + contacts.length}
          onDialClick={callHandler}
          onDialClickVideo={
            allowVideo ? number => callHandler(number, true) : undefined
          }
          cdrs={cdrs}
          onCdrClick={callHandler}
          onContactClick={(phones = []) => callHandler(phones[0])}
          contacts={contacts}
          contactsFilter={contactsFilter}
          onContactsFilterChange={setContactsDialerFilter}
        />
      </View>

      <SessionScreen
        {...session}
        key={session?.id}
        session={session}
        hold={session?.isHold()}
        visible={session?.id}
        onCancel={VPhone.hang}
        onAccept={VPhone.answer}
        onTransfer={() => showTransferDialerHandler(false)}
        onBlindTransfer={() => showTransferDialerHandler(true)}
        onContactClick={contactClickHandler}
        allowTransfer={allowTransfer}
        allowBlindTransfer={allowBlindTransfer}
      />

      <SessionScreen
        key={sessiont?.id}
        session={sessiont}
        visible={session?.id}
        onCancel={noop}
        onAccept={noop}
        isTransfer={true}
      />

      <Screen 
        visible={show_transfer}
        closeable
        onClose={noop}
        style={{ paddingTop: 30 }}
      >
        <Dialer
          testID="transferDialer"
          isTransfer={true}
          onDialClick={transferHandler}
          onCdrClick={transferHandler}
          onContactClick={(phones = []) => transferHandler(phones[0])}
          cdrs={cdrs}
          contacts={contacts}
          contactsFilter={contactsFilter}
          onContactsFilterChange={setContactsDialerFilter}
        />
      </Screen>
    </View>
  )
};

export default Phone;
