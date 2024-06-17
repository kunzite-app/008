import { useEffect } from 'react';
import { View, Text, Button } from 'react-native';

import { RTCView } from 'react-native-webrtc';

import Contacts from 'react-native-contacts';

import { VPhone } from './VPhone';
import { useStore } from './store';

const xx = async () => {
  const contacts = await Contacts.getAll();
  console.log(contacts);
}

const Phone = () => {
  const { status, stream } = useStore();

  useEffect(() => {
    VPhone.askPermissions();
    VPhone.register();

    // xx();
  }, []);

  const number_out = '917370191';
  const opts = { number: '633650984', extraHeaders: [`P-Asserted-Identity:${number_out}`, `x-Number:${number_out}`] }
  return (
    <View style={{ padding: 5, flex: 1, justifyContent: 'center',  alignItems: 'center', }}>
      <Text style={{ fontSize: 40 }}>{status}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {status === 'ringing' &&
          <Button style={{ fontSize: 4 }} onPress={VPhone.answer} title="Accept" />
        }
        {(status === 'ringing' || status === 'busy') &&
          <Button style={{ fontSize: 40 }} onPress={VPhone.hang} title="Hang up" />
        }
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {status !== 'busy' &&
          <Button style={{ fontSize: 4 }} onPress={() => VPhone.call(opts)} title="Call" />
        }
      </View>

      <RTCView streamURL={VPhone.session?.getStream().toURL()} zOrder={0} objectFit={'cover'} />
    </View>
  )
};

export default Phone;
