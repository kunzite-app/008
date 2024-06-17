import {useEffect, useState, useRef} from 'react';
import {Platform, View, Text} from 'react-native';

import {
  requestNotifications,
  request,
  PERMISSIONS,
} from 'react-native-permissions';

import messaging from '@react-native-firebase/messaging';

import RNCallKeep from 'react-native-callkeep';

import { registerGlobals, RTCView } from 'react-native-webrtc-web-shim';
import { UA } from 'sip.js';

const isIOS = Platform.OS === 'ios';

const FBHOST = '';
const wsServers = [``];
const uri = `sip:@zendesk.owlsip.com`;
const password = '';

registerGlobals();


/*
messaging().setBackgroundMessageHandler(async (message) => {
  console.log(message);
  // setUA();
});
*/

const Phone = () => {
  const UA_ = useRef(null);
  const SESSION = useRef(null);
  const STREAM = useRef(new MediaStream());
  const [status, setStatus] = useState('idle');

  const answerCallAction = async (data) => {
    try {
      // RNCallKeep.backToForeground();
      SESSION.current?.accept();
    } catch (err) {
      console.error(err);
    }
  };

  const endCallAction = async (data) => {
    try {
      SESSION.current?.terminate();
    } catch (err) {
      console.error(err);
    }
  };

  const registerFB = async() => {
    try {
      const token = await messaging().getToken();
      const response = await fetch(`${FBHOST}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sipUser, token })
      });
  
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
  
      const { err } = await response.json();
      if (err) throw new Error(err);
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  const setUA = () => {
    UA_?.current?.stop();

    const ua = new UA({
      uri,
      password,
      transportOptions: {
        wsServers,
      },
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: false,
        }
      },
    });

    ua.on('invite', async session => {
      if (status === 'busy') {
        session.reject();
        return;
      }

      const id = session.request.getHeader('X-Call-ID') || session.request.getHeader('Call-ID');
      const {
        uri: { user: from },
      } = session.remoteIdentity;

      const uuid = id;
      console.error(uuid)
      session.on('accepted', () => {
        setStatus('busy');
        RNCallKeep.answerIncomingCall(uuid);
        RNCallKeep.setCurrentCallActive(uuid);
      });

      session.on('terminated', () => {
        setStatus('idle');
        SESSION.current = undefined;
        STREAM.current = new MediaStream();
        RNCallKeep.endCall(uuid);
        setStatus('');
      });

      session.on('trackAdded', () => {
        const { peerConnection } = session.sessionDescriptionHandler;
        peerConnection.getReceivers().forEach(receiver => {
          const track = receiver.track;
          if (track) {
            STREAM.current.addTrack(track);
          }
        });
      });

      setStatus('ringing');
      RNCallKeep.displayIncomingCall(uuid, from);
      RNCallKeep.backToForeground();

      SESSION.current = session;
    });

    ua.start();
    UA_.current = ua;
  }

  const init = async () => {
    await requestNotifications(['alert', 'sound']);

    if (isIOS) {
      await request(PERMISSIONS.IOS.MICROPHONE);
      await request(PERMISSIONS.IOS.CAMERA);
    } else {
      await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      await request(PERMISSIONS.ANDROID.CAMERA);

      await request(PERMISSIONS.ANDROID.READ_PHONE_STATE);
      await request(PERMISSIONS.ANDROID.CALL_PHONE);

      await request(PERMISSIONS.POST_NOTIFICATIONS);
    }

    
    RNCallKeep.setup({
      ios: {
        appName: 'Astroline Softphone',
      },
      android: {
        alertTitle: 'Permissions are required',
        alertDescription: 'Astroline needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        //imageName: 'phone_account_icon',
        imageName: 'sim_icon',
        // additionalPermissions: [PERMISSIONS.READ_CONTACTS],

        // Required  to get audio in background when using Android 11
        foregroundService: {
          channelId: 'com.astroline',
          channelName: 'Foreground service for Astroline',
          notificationTitle: 'Astroline Softphone is running on background',
          //notificationIcon: 'Path to the resource icon of the notification',
        },
      },
    });

    RNCallKeep.setAvailable(true);
    RNCallKeep.canMakeMultipleCalls(false);
    RNCallKeep.addEventListener('answerCall', answerCallAction);
    RNCallKeep.addEventListener('endCall', endCallAction);
    
    const subscribeToTopic = async () => {
      await messaging().getToken();
      await messaging().subscribeToTopic('general');
      console.log('Subscribed to topic!');
    };

    setUA();

    /*
    await registerFB();
    */

    await subscribeToTopic();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', remoteMessage);
      setUA();
    });

    messaging().setBackgroundMessageHandler(async (message) => {
      console.log(message);
      setUA();
    });

    return () => {
      unsubscribe();
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <View style={{ backgroundColor: '#00ff00' }}>
      <Text>{status}</Text>
      <RTCView /*streamURL={STREAM.current.toURL()}*/ stream={STREAM.current} objectFit={'cover'} zOrder={0} />
    </View>
  )
};

export default Phone;
