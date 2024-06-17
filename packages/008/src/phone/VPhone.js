import { Platform } from 'react-native';
import { PERMISSIONS, request, requestNotifications, checkMultiple } from 'react-native-permissions';

import messaging from '@react-native-firebase/messaging';
import { registerGlobals } from 'react-native-webrtc';
import RNCallKeep from 'react-native-callkeep';
// import { v4 as UUID } from 'uuid';

import {
  Inviter, 
  UserAgent, 
  Registerer, 
  RegistererState, 
  SessionState, 
} from './Sip';

import { useStore } from './store';
import { RING_BACK, RING_TONE } from '../Sound';

registerGlobals();

const UUID = () => new Date().getTime() + '.' + Math.random();
const play_reject = () => console.error('Playing reject sound')
const play_error = () => console.error('Playing error sound');

const isWeb = Platform.OS === 'web';

export class VPhone {
  static status = 'idle';
  
  static ua;
  static session = undefined;
  static sessiont = undefined;
  
  static headers = [];
  static sip = { 
    wsUri: ``,
    sipUri: ``,
    sipPassword: '',
    sipUser: undefined,
    userAgent: '008 Softphone'
  };

  static askPermissions = async () => {  
    if (Platform.OS === 'web') {
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
      } catch (err) {
        console.error('Failed obtaining audio/video permissions', err);
      }
  
      // TODO: this has to be when the user interacts with the app
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error('Failed obtaining Notification permissions', err);
      }
  
    } else {

      if (Platform.OS === 'ios') {
        await request(PERMISSIONS.IOS.MICROPHONE);
        await request(PERMISSIONS.IOS.CAMERA);

        await request(PERMISSIONS.IOS.READ_CONTACTS);

      } else {
        await requestNotifications(['alert', 'sound']);

        await checkMultiple([ 
          PERMISSIONS.ANDROID.RECORD_AUDIO, 
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.READ_PHONE_STATE,
          PERMISSIONS.ANDROID.CALL_PHONE,
          PERMISSIONS.ANDROID.READ_CONTACTS
        ]);

        /*
        await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        await request(PERMISSIONS.ANDROID.CAMERA);

        await request(PERMISSIONS.ANDROID.READ_PHONE_STATE);
        await request(PERMISSIONS.ANDROID.CALL_PHONE);

        await request(PERMISSIONS.POST_NOTIFICATIONS);

        await request(PERMISSIONS.ANDROID.READ_CONTACTS);
        */
      }
    }
  }

  static log = (message) => {
    console.warn(message);

    /*
    fetch('https://nr1sbphs-2008.uks1.devtunnels.ms/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    */
  }

  static initBackground = async () => {
    if (isWeb) return;

    messaging().setBackgroundMessageHandler(async (message) => {
      VPhone.log({ message, who: 'outside' });
      VPhone.register();
    });
    messaging().subscribeToTopic('general');

    RNCallKeep.setup({
      android: {
        alertTitle: 'Permissions are required',
        alertDescription: '008 needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        //imageName: 'phone_account_icon',
        imageName: 'sim_icon',
        // additionalPermissions: [PERMISSIONS.READ_CONTACTS],

        // Required  to get audio in background when using Android 11
        foregroundService: {
          channelId: 'app.kunzite',
          channelName: 'Foreground service for 008',
          notificationTitle: '008 Softphone is running on background',
          //notificationIcon: 'Path to the resource icon of the notification',
        },
      },
    });

    RNCallKeep.setAvailable(true);
    RNCallKeep.canMakeMultipleCalls(false);

    RNCallKeep.addEventListener('answerCall', VPhone.answer);
    RNCallKeep.addEventListener('endCall', VPhone.hang);
    RNCallKeep.addEventListener('didToggleHoldCallAction', VPhone.hold);
    RNCallKeep.addEventListener('didPerformDTMFAction', ({ digits, callUUID }) => VPhone.dftm(digits));

    RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {
      console.warn('didPerformSetMutedCallAction', muted, callUUID);
      VPhone.mute({ mute: muted });
    });
    
    RNCallKeep.addEventListener('didChangeAudioRoute', ({ output }) => {
      console.warn('didChangeAudioRoute', output);
    });
    
    RNCallKeep.addEventListener('silenceIncomingCall', ({ handle, callUUID, name }) => {
      console.warn('silenceIncomingCall', handle, callUUID, name);
    });

    RNCallKeep.addEventListener('didReceiveStartCallAction', async (data) => {
      const { callUUID: uuid, handle: number } = data;
      await VPhone.call({ number, uuid });
    });

    RNCallKeep.addEventListener('didLoadWithEvents', async (events) => {
      const callev = events.find(({ name }) => name === 'RNCallKeepDidReceiveStartCallAction');

      if (callev){
        const { handle: number, callUUID: uuid } = callev.data;
        await VPhone.call({ number, uuid });
      } 
    });

    const token = await messaging().getToken();
    VPhone.log({ token });
  }

  static register = async () => {
    if (VPhone.ua?.isConnected()) return;

    const { sipUri, sipPassword, sipUser, wsUri, userAgent } = VPhone.sip;
    const { setState } = useStore.getState();

    try {
      const ua = new UserAgent({
        uri: UserAgent.makeURI(sipUri),
        authorizationUsername: sipUser,
        authorizationPassword: sipPassword,
        userAgentString: userAgent,
        transportOptions: {
          server: wsUri
        },
        delegate: {
          onInvite: async (session) => {
            if (VPhone.session) {
              session.reject();
              return;
            }

            await VPhone.backToForeground();
            VPhone.log({ message: 'UA ringing' });

            const { uri: { user }} = session.remoteIdentity;
            const from = session.isInbound()
              ? user
              : session.request.getHeader('P-Asserted-Identity');

            const uuid = UUID();

            session.stateChange.addListener(state => {
              switch (state) {
                case SessionState.Established: {
                  // RING_TONE.stop();

                  session.delegate = {
                    onBye: play_reject
                  };

                  const status = 'busy';
                  VPhone.status = status;
                  
                  setState({ status: VPhone.status });

                  if (!isWeb) {
                    RNCallKeep.answerIncomingCall(uuid);
                    RNCallKeep.setCurrentCallActive(uuid);
                  }

                  break;
                } case SessionState.Terminated: {
                  // RING_TONE.stop();

                  VPhone.session = undefined;

                  const status = 'idle';
                  VPhone.status = status;

                  setState({ status: VPhone.status, session: VPhone.session });

                  if (!isWeb)
                    RNCallKeep.endCall(uuid);
                }
              }
            });

            // RING_TONE.stop();

            VPhone.session = session;

            const status = 'ringing';
            VPhone.status = status;

            setState({ status: VPhone.status, session: VPhone.session });

            if (!isWeb) {
              await RNCallKeep.displayIncomingCall(uuid, from);
            }
          },
          onConnect: () => {
            console.warn('connected');
          },
          onDisconnect: error => {
            console.warn('disconnected', error);
          }
        }
      });

      await ua.start();

      const registerer = new Registerer(ua);
      registerer.stateChange.addListener(state => {
        switch (state) {
          case RegistererState.Registered:
            VPhone.log({ message: 'UA registered' });
            break;
          case RegistererState.Unregistered:
            console.warn('UA unregistered');
            break;
          case RegistererState.Terminated:
            console.warn('UA terminated');
            break;
        }
      });
      await registerer.register();

      VPhone.ua = ua;
    } catch (err) {
      play_error();
    }
  }

  static answer = ({ video = false }) => {
    const { session } = VPhone;

    try {
      session?.accept({
        sessionDescriptionHandlerOptions: {
          /*
          constraints: {
            // audio: { deviceId: { ideal: microphone } },
            video
          }
          */
        }
      });
    } catch (err) {
      console.warn('answerCallAction', err);
      play_error();
    }
  }

  static hang = () => {
    const { session } = VPhone;

    try {
      switch (session?.state) {
        case SessionState.Initial:
        case SessionState.Establishing:
          session.isInbound() ? session.reject() : session.cancel();
          break;
        case SessionState.Established:
          session.bye();
          break;
      }
    } catch (err) {
      console.warn('endCallAction', err);
    }

    VPhone.session = undefined;
  }

  static call = async ({ 
    number, 
    extraHeaders = [],
    video = false, 
    uuid = UUID(),
    }) => {
    if (VPhone.session) return;

    const { headers = [], sip: { sipUri} } = VPhone;
    const { setState } = useStore.getState();

    await VPhone.backToForeground();
    await VPhone.register();

    try {
      const {
        raw: { host, port, scheme }
      } = UserAgent.makeURI(sipUri);
      const clean = number; //cleanPhoneNumber(number);
      const target =
        UserAgent.makeURI(clean) ||
        UserAgent.makeURI(
          `${scheme}:${clean}@${host}${port ? `:${port}` : ''}`
        );

      const session = new Inviter(VPhone.ua, target, {
        extraHeaders: [ ...headers, ...extraHeaders ]
      });

      session.stateChange.addListener(state => {
        switch (state) {
          case SessionState.Established: {
            // RING_BACK.stop();

            session.delegate = {
              onBye: play_reject
            };

            if (!isWeb)
              RNCallKeep.setCurrentCallActive(uuid);

            break;
          } case SessionState.Terminated: {
            // RING_BACK.stop();

            VPhone.session = undefined;

            const status = 'idle';
            VPhone.status = status;

            setState({ status: VPhone.status, session: VPhone.session });

            if (!isWeb)
              RNCallKeep.endCall(uuid);
          }
        }
      });

      session.invite({
        sessionDescriptionHandlerOptions: {
        /*
          constraints: {
            // audio: { deviceId: { ideal: microphone } },
            video
          }
        },
        */
        requestDelegate: {
          onReject: play_reject
        }
      }});

      VPhone.session = session;

      const status = 'busy';
      VPhone.status = status;

      setState({ status: VPhone.status, session: VPhone.session });

      // RING_BACK.play();

      
      if (!isWeb) 
        RNCallKeep.startCall(uuid, number, number);
      

    } catch (err) {
      console.error('startCallAction', err);
      play_error();
    }
  };

  static hold = async ({ hold }) => {
    VPhone.session?.setHold(hold);
  }

  static mute = async ({ muted }) => { 
    VPhone.session?.setMuted(muted);
  }

  static dftm = async (key) => { 
    VPhone.session?.dtmf(key);
  }

  static transfer = async ({ number }) => { 
    throw new Error('Not implemented');
  }

  static backToForeground = async () => {
    VPhone.log({ message: 'backToForeground' });

    if (isWeb) return;
    try {
      await RNCallKeep.backToForeground();
    } catch(err) {
      console.error('backToForeground', err);
    }
  }
}
