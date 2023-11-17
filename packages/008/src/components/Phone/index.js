import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { UA } from 'sip.js';

import {
  RING_TONE,
  RING_BACK,
  NOTIFICATION_TONE,
  play_failure,
  play_hangup
} from '../../Sound';

import { Dialer } from '../Dialer';
import { Header } from './Components';
import { Screen } from '../../screens/Screen';
import { SessionScreen } from '../../screens/SessionScreen';

import { Cdr } from '../../store/Cdr';
import { Context, useStore } from '../../store/Context';
import { emit } from '../../Events';
import { cleanPhoneNumber, sleep, genId, blobToDataURL } from '../../utils';
import { tts } from '../../008Q';

import { name as packageName } from '../../../package.json';

class Phone extends React.Component {
  constructor(props) {
    super(props);

    this.defaults = {
      dialer_number: '',

      session: null,
      sessiont: null,

      show_transfer: false,
      show_blindTransfer: false
    };

    this.state = {
      ...this.defaults,

      network: true,

      ...props
    };
  }

  emit = ({ type, data = {} }) => {
    if (type === 'phone:ringing') {
      this.context.toggleShowSettings(false);

      const {
        cdr: { contact = {}, from, direction }
      } = data;

      if (direction === 'inbound') {
        try {
          const notification = new Notification(packageName, {
            icon: 'icon.png',
            title: `${packageName}`,
            body: `${contact.name || ''} (${from})`,
            silent: true
          });

          notification.onclick = ev => {
            ev.preventDefault();
            notification.close();

            window?.parent?.focus?.() || window?.focus?.();
            emit({ type: 'notification:click', data: { contact } });
          };
        } catch (err) {
          console.error('Notification error', err);
        }
      }
    }

    if (type === 'phone:accepted') {
      const { cdr } = data;
      cdr?.accepted();
    }

    if (type === 'phone:terminated') {
      const { cdr } = data;

      if (cdr) {
        cdr.terminated();
        this.context.cdrAdd(cdr);
      }
    }

    emit({ type, data });
  };

  set_events = () => {
    document?.addEventListener('click2call', ({ detail: data }) => {
      let { number } = data;

      if (['tel', 'callto', 'sip'].some(word => number.startsWith(word))) {
        const { pathname } = new URL(number);
        number = pathname.replace('//', '');
      }

      const phoneRegex = /^[(+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-().0-9]*$/g;
      if (!phoneRegex.test(number)) throw new Error('Invalid number');

      this.call({ number });
    });
  };

  set_network_handler = () => {
    window?.addEventListener('offline', () =>
      this.setState({ network: false })
    );

    window?.addEventListener('online', () => this.setState({ network: true }));
  };

  set_ua_daemon = () => {
    if (this.ua) {
      this.ua.stop();
      clearInterval(this.connWatcher);
      clearInterval(this.networkWatcher);
    }

    this.set_ua();

    this.connWatcher = setInterval(() => {
      const { status } = this.state;
      if (!this.ua?.isRegistered() && status !== 'offline') this.set_ua();
    }, 5 * 1000);

    this.networkWatcher = setInterval(() => {
      const { network, session } = this.state;
      if (!network && session) play_failure();
    }, 5 * 1000);
  };

  set_ua = async () => {
    const {
      sipUri,
      sipUser,
      sipPassword,
      wsUri,
      status,
      userAgent = '008 Softphone'
    } = this.state;

    this.ua?.stop();

    if (!wsUri?.length) return;

    const register = status !== 'offline';
    const ua = new UA({
      uri: sipUri,
      authorizationUser: sipUser,
      password: sipPassword,
      userAgentString: userAgent,
      autostart: false,
      register,
      transportOptions: {
        wsServers: [wsUri],
        traceSip: false,
        connectionTimeout: 5,
        reconnectionTimeout: 5,
        maxReconnectionAttempts: 0
      }
    });

    ua.on('transportCreated', transport => {
      transport.on('disconnected', async () =>
        this.setState({ rand: genId() })
      );
    });

    ['unregistered', 'registrationFailed', 'registered'].forEach(ev => {
      ua.on(ev, () => this.setState({ rand: genId() }));
    });

    ua.on('invite', async session => {
      if (this.state.session?.id) {
        session.terminate();
        return;
      }

      this.processRecording({ session });

      const cdr = new Cdr({ session });
      cdr.setContact(
        this.context.contacts().contact_by_phone({ phone: cdr.from })
      );
      session.cdr = cdr;

      session.on('accepted', () => {
        RING_TONE.stop();
        NOTIFICATION_TONE.stop();
        this.setState({ rand: genId() });

        this.emit({ type: 'phone:accepted', data: { cdr } });
      });

      session.on('terminated', (_, cause) => {
        this.reset(cause);
        this.emit({ type: 'phone:terminated', data: { cdr } });
      });

      session.on('failed', ev => {
        play_failure();
      });

      this.setState({ session }, async () => {
        const { allowAutoanswer, autoanswer } = this.state;

        this.emit({ type: 'phone:ringing', data: { cdr } });

        if (allowAutoanswer || session.autoanswer()) {
          NOTIFICATION_TONE.play();

          const sessionSecs = parseInt(session.autoanswer());
          await sleep(!isNaN(sessionSecs) ? sessionSecs : autoanswer);
          if (!session.hasAnswer && !session.endTime) session.accept();
        } else {
          RING_TONE.play();
        }
      });
    });

    ua.start();
    this.ua = ua;
  };

  answer = async () => {
    const { session, microphone } = this.state;
    if (session?.hasAnswer) return;

    const video = session.request?.body?.includes('m=video');
    session?.accept({
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: { deviceId: { ideal: microphone } },
          video
        }
      }
    });
  };

  hangup = async () => {
    const { session } = this.state;
    if (session?.endTime) return;
    session.terminate();
  };

  call = async (opts = {}) => {
    const { dialer_number, number_out, microphone } = this.state;
    const { number = dialer_number, extraHeaders = [], video = false } = opts;

    const indentityHeaders = number_out
      ? [`P-Asserted-Identity:${number_out}`, `x-Number:${number_out}`]
      : [];

    try {
      const target = cleanPhoneNumber(number);
      const session = this.ua.invite(target, {
        extraHeaders: [...indentityHeaders, ...extraHeaders],
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: { deviceId: { ideal: microphone } },
            video
          }
        }
      });

      this.processRecording({ session });

      const cdr = new Cdr({ session });
      cdr.setContact(
        this.context.contacts().contact_by_phone({ phone: cdr.to })
      );
      session.cdr = cdr;

      session.on('accepted', () => {
        RING_BACK.stop();
        this.setState({ rand: genId() });

        this.emit({ type: 'phone:accepted', data: { cdr } });
      });

      session.on('terminated', (_, cause) => {
        this.reset(cause);
        this.emit({ type: 'phone:terminated', data: { cdr } });
      });

      session.on('failed', message => {
        play_failure(message);
      });

      RING_BACK.play();
      this.emit({ type: 'phone:ringing', data: { cdr } });
      this.setState({ session });
    } catch (_) {
      play_failure();
      this.reset();
    }
  };

  transfer = (opts = {}) => {
    try {
      const { session, dialer_number, show_blindTransfer, microphone, number_out } =
        this.state;

      const {
        number = dialer_number,
        blind = show_blindTransfer,
        extraHeaders = [],
        video = false
      } = opts;

      const indentityHeaders = number_out
        ? [`P-Asserted-Identity:${number_out}`, `x-Number:${number_out}`]
        : [];
      
      const target = cleanPhoneNumber(number);
      const payload = {
        extraHeaders: [...indentityHeaders, ...extraHeaders],
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: { deviceId: { ideal: microphone } },
            video
          }
        }
      };

      if (blind) {
        session.refer(target, payload);
        return;
      }

      const sessiont = this.ua.invite(target, payload);

      const cdr = new Cdr({ session: sessiont });
      cdr.setContact(this.context.contacts().contact_by_phone({ phone: cdr.to }));
      sessiont.cdr = cdr;

      sessiont.on('progress', () => {
        RING_BACK.play();
      });

      sessiont.on('accepted', () => {
        RING_BACK.stop();
        this.setState({ rand: genId() });
      });

      sessiont.on('terminated', (_, cause) => {
        RING_BACK.stop();

        this.setState({ sessiont: null }, () => {
          try {
            session?.unhold();
          } catch (err) {
            this.reset(cause);
          }
        });
      });

      sessiont.on('failed', message => {
        play_failure(message);
      });

      this.setState({ sessiont });
    } catch (err) {
      play_failure();
    }
  };

  reset = cause => {
    const { sessiont } = this.state;
    try {
      sessiont?.terminate();
    } catch (err) {}

    this.setState(this.defaults, () => {
      RING_TONE.stop();
      RING_BACK.stop();
      NOTIFICATION_TONE.stop();
    });

    if (cause === 'BYE') play_hangup();
  };

  processRecording = ({ session }) => {
    const type = 'audio/webm';

    const chunksBlob = chunks => {
      if (!chunks.length) return;

      return blobToDataURL(new Blob(chunks, { type }));
    };

    const chunksBlob2 = chunks => {
      if (!chunks.length) return;

      return new Uint8Array(new Blob(chunks, { type: 'audio/ogg' }));
    };

    const streamIn = new MediaStream();
    const streamOut = new MediaStream();


    let recorder;
    const chunks = [];

    let recorderIn;
    const chunksIn = [];

    let recorderOut;
    const chunksOut = [];

    session.on('accepted', async () => {
      const { peerConnection } = session.sessionDescriptionHandler;
      const audioContext = new AudioContext();
      const multi = audioContext.createMediaStreamDestination();

      const addTracks = (tracks, stream, recorder, chunks) =>
        tracks.forEach(({ track }) => {
          stream.addTrack(track);

          const src = audioContext.createMediaStreamSource(stream);
          src.connect(multi);

          recorder = new MediaRecorder(stream, { mimeType: type });
          recorder.ondataavailable = ({ data }) => chunks.push(data);
          recorder.start();
        });

      addTracks(peerConnection.getSenders(), streamOut, recorderOut, chunksOut);
      addTracks(peerConnection.getReceivers(), streamIn, recorderIn, chunksIn);

      recorder = new MediaRecorder(multi.stream, { mimeType: type });
      recorder.ondataavailable = ({ data }) => chunks.push(data);
      recorder.onstop = async () => {
        const id = session.cdr?.id;
        const blob = await chunksBlob(chunks);
        this.emit({ type: 'phone:recording', data: { audio: { id, blob } } });

        try {
          const { segments } = await tts({
            audio: {
              remote: await chunksBlob2(chunksIn),
              local: await chunksBlob2(chunksOut)
            }
          });

          this.emit({
            type: 'phone:transcript',
            data: { transcript: { id, segments } }
          });
        } catch (err) {
          console.error(err);
        }
      };

      recorder.start();
    });

    session.on('terminated', () => {
      recorder?.stop();

      recorderIn?.stop();
      recorderOut?.stop();
    });
  };

  componentDidUpdate(prevProps, prevState) {
    const { state } = this;

    const fields = ['wsUri', 'sipUri', 'sipUser', 'sipPassword'];
    if (!_.isEqual(_.pick(prevState, fields), _.pick(state, fields))) {
      this.set_ua();
    }

    if (prevState.status !== state.status) {
      const { ua } = this;
      if (state.status === 'offline')
        if (ua?.isRegistered()) ua?.unregister();
        else if (!ua?.isRegistered()) ua?.register();
    }

    if (prevState.ringer !== state.ringer) {
      RING_TONE.setDevice(state.ringer);
      NOTIFICATION_TONE.setDevice(state.ringer);
    }

    if (!state.sipUri?.length) this.ua?.stop();
  }

  componentDidMount = async () => {
    this.unsubscribe = useStore.subscribe(state => {
      const {
        numbers = [],
        speaker,
        microphone,
        ringer,
        devices,
        status,
        statuses,
        wsUri,
        sipUri,
        sipUser,
        sipPassword,

        nickname,
        avatar,

        allowAutoanswer,
        autoanswer,
        transferAllowed,
        blindTransferAllowed,
        allowVideo,

        contactsDialer: contacts,
        contactsDialerFilter: contactsFilter
      } = state;

      const { number_out = numbers[0]?.number } = state;

      this.setState({
        numbers,
        number_out,
        speaker,
        microphone,
        ringer,
        devices,
        status,
        statuses,
        wsUri,
        sipUri,
        sipUser,
        sipPassword,

        nickname,
        avatar,

        allowAutoanswer,
        autoanswer,
        blindTransferAllowed,
        transferAllowed,
        allowVideo,

        contacts,
        contactsFilter
      });
    });

    this.set_events();
    this.set_network_handler();
    this.set_ua_daemon();
  };

  componentWillUnmount() {
    this.ua?.stop();
    clearInterval(this.connWatcher);
    clearInterval(this.networkWatcher);

    this.unsubscribe?.();
  }

  render = () => {
    const {
      session,
      sessiont,
      show_transfer,

      dialer_number,

      numbers = [],
      number_out,

      statuses = [],
      status,
      network,
      nickname,
      avatar,

      transferAllowed,
      blindTransferAllowed,
      allowVideo,

      contacts = {},
      contactsFilter
    } = this.state;

    const noConnection = !this.ua?.isRegistered() || !network;
    const status_color = statuses.find(
      item => item.value === (noConnection ? 'offline' : status)
    )?.color;

    const callHandler = async (number, video) => {
      await this.call({ number, video });
    };

    const showTransferDialerHandler = async (blind = false) => {
      session?.hasAnswer && session?.hold();
      this.setState({ show_transfer: true, show_blindTransfer: blind });
    };

    const transferOnCancelHandler = async () => {
      this.setState({ show_transfer: false }, async () => {
        try { sessiont?.terminate() } catch(err){};
        session?.unhold();
      });
    };

    const transferConfirmHandler = () => sessiont.refer(session);

    const onTransferHandler = number => {
      this.setState({ show_transfer: false }, async () => {
        await this.transfer({ number });
      });
    };

    const onNumberChangeHandler = ([number = {}]) =>
      this.context.setSettings({ number_out: number.value });

    const contactClickHandler = contact =>
      this.emit({ type: 'contact:click', data: { contact } });

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, marginTop: 10 }}>
          <Header
            numbers={numbers}
            number_out={number_out}
            onChange={onNumberChangeHandler}
            nickname={nickname}
            avatar={avatar}
            status_color={status_color}
            onSettingsClick={() => this.context.toggleShowSettings(true)}
          />

          <Dialer
            style={{ marginTop: 25 }}
            key={session?.id}
            number={dialer_number}
            onDialClick={callHandler}
            onDialClickVideo={
              allowVideo ? number => callHandler(number, true) : undefined
            }
            cdrs={this.context.cdrs}
            onCdrClick={callHandler}
            onContactClick={(phones = []) => callHandler(phones[0])}
            contacts={contacts}
            contactsFilter={contactsFilter}
            onContactsFilterChange={this.context.setContactsDialerFilter}
          />
        </View>

        <SessionScreen
          key={session?.id}
          session={session}
          visible={!_.isEmpty(session)}
          onCancel={this.hangup}
          onAccept={
            session?.isInbound() && !session?.hasAnswer ? this.answer : null
          }
          onTransfer={() => showTransferDialerHandler(false)}
          onBlindTransfer={() => showTransferDialerHandler(true)}
          onContactClick={contactClickHandler}
          transferAllowed={transferAllowed}
          blindTransferAllowed={blindTransferAllowed}
        />

        <SessionScreen
          key={sessiont?.id}
          session={sessiont}
          visible={!_.isEmpty(sessiont)}
          onCancel={transferOnCancelHandler}
          onAccept={sessiont?.hasAnswer && transferConfirmHandler}
          transferAllowed={false}
          blindTransferAllowed={false}
          isTransfer={true}
        />

        <Screen
          visible={show_transfer}
          closeable
          onClose={transferOnCancelHandler}
          style={{ paddingTop: 30 }}
        >
          <Dialer
            isTransfer={true}
            onDialClick={onTransferHandler}
            onCdrClick={onTransferHandler}
            onContactClick={(phones = []) => onTransferHandler(phones[0])}
            cdrs={this.context.cdrs}
            contacts={contacts}
            contactsFilter={contactsFilter}
            onContactsFilterChange={this.context.setContactsDialerFilter}
          />
        </Screen>
      </View>
    );
  };
}

Phone.contextType = Context;
export default Phone;
