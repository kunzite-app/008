import React from 'react';
import { View } from 'react-native';

import _ from 'lodash';

import { processAudio } from '008Q';

import {
  UserAgent,
  Registerer,
  Inviter,
  RegistererState,
  SessionState
} from '../../Sip';

import { RING_TONE, RING_BACK, play_tone, play_reject } from '../../Sound';

import { Dialer } from '../Dialer';
import { Header } from './Components';
import { Screen } from '../../screens/Screen';
import { SessionScreen } from '../../screens/SessionScreen';

import { Cdr } from '../../store/Cdr';
import { Context, useStore } from '../../store/Context';
import { emit } from '../../store/Events';
import { cleanPhoneNumber, sleep, genId, blobToDataURL } from '../../utils';

import { name as packageName } from '../../../package.json';

const USER_AGENT = '008 Softphone';

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

  click2CallHandler = () => {
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

  networkHandler = () => {
    window?.addEventListener('offline', () =>
      this.setState({ network: false })
    );
    window?.addEventListener('online', () => this.setState({ network: true }));

    this.networkWatcher = setInterval(() => {
      const { network, session } = this.state;
      if (!network && session) play_tone();
    }, 5 * 1000);
  };

  startUADaemon = () => {
    this.set_ua();

    this.connWatcher = setInterval(() => {
      const { status } = this.state;
      if (!this.ua?.isConnected() && status !== 'offline') this.ua?.reconnect();
    }, 5 * 1000);
  };

  set_ua = async () => {
    const {
      sipUri,
      sipUser,
      sipPassword,
      wsUri,
      status,
      userAgent = USER_AGENT
    } = this.state;

    this.ua?.stop();

    if (!wsUri?.length || !sipUri?.length) return;
    const ua = new UserAgent({
      uri: UserAgent.makeURI(sipUri),
      authorizationUsername: sipUser,
      authorizationPassword: sipPassword,
      userAgentString: userAgent,
      transportOptions: {
        server: wsUri
      },
      delegate: {
        onInvite: session => {
          if (this.state.session?.id) {
            session.reject();
            return;
          }

          this.setState({ session }, async () => {
            this.processRecording({ session });

            const cdr = new Cdr({ session });
            const contact = this.context
              .contacts()
              .contact_by_phone({ phone: cdr.from });
            cdr.setContact(contact);
            session.cdr = cdr;

            session.stateChange.addListener(state => {
              switch (state) {
                case SessionState.Established:
                  RING_TONE.stop();
                  this.setState({ rand: genId() });
                  this.emit({ type: 'phone:accepted', data: { cdr } });

                  session.delegate = {
                    onBye: () => play_reject()
                  };
                  break;
                case SessionState.Terminated:
                  this.reset();
                  this.emit({ type: 'phone:terminated', data: { cdr } });
                  break;
              }
            });

            this.emit({ type: 'phone:ringing', data: { cdr } });

            RING_TONE.play();
            const { allowAutoanswer, autoanswer } = this.state;
            if (allowAutoanswer || session.autoanswer()) {
              const sessionSecs = parseInt(session.autoanswer());
              await sleep(!isNaN(sessionSecs) ? sessionSecs : autoanswer);
              if (session.state === SessionState.Establishing) session.accept();
            }
          });
        },
        onConnect: () => {
          this.setState({ rand: genId() });
        },
        onDisconnect: error => {
          this.setState({ rand: genId() });
        }
      }
    });

    if (status !== 'offline') {
      await ua.start();

      const registerer = new Registerer(ua);
      registerer.stateChange.addListener(state => {
        switch (state) {
          case RegistererState.Registered:
          case RegistererState.Unregistered:
          case RegistererState.Terminated:
            this.setState({ rand: genId() });
            break;
        }
      });
      await registerer.register();
    }

    this.ua = ua;
  };

  answer = async () => {
    const { session, microphone } = this.state;
    const video = session.isVideo();
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

    switch (session.state) {
      case SessionState.Initial:
      case SessionState.Establishing:
        session.isInbound() ? session.reject() : session.cancel();
        break;
      case SessionState.Established:
        session.bye();
        break;
    }

    // TODO: check this
    this.reset();
  };

  call = async (opts = {}) => {
    const { dialer_number, number_out, microphone, sipUri } = this.state;
    const { number = dialer_number, extraHeaders = [], video = false } = opts;

    const identityHeaders = number_out
      ? [`P-Asserted-Identity:${number_out}`, `x-Number:${number_out}`]
      : [];

    try {
      const {
        raw: { host, port, scheme }
      } = UserAgent.makeURI(sipUri);
      const clean = cleanPhoneNumber(number);
      const target =
        UserAgent.makeURI(clean) ||
        UserAgent.makeURI(
          `${scheme}:${clean}@${host}${port ? `:${port}` : ''}`
        );
      const session = new Inviter(this.ua, target, {
        extraHeaders: [...identityHeaders, ...extraHeaders]
      });

      this.processRecording({ session });

      const cdr = new Cdr({ session });
      const contact = this.context
        .contacts()
        .contact_by_phone({ phone: cdr.to });
      cdr.setContact(contact);
      session.cdr = cdr;

      session.stateChange.addListener(state => {
        switch (state) {
          case SessionState.Established:
            RING_BACK.stop();
            this.setState({ rand: genId() });

            this.emit({ type: 'phone:accepted', data: { cdr } });

            session.delegate = {
              onBye: () => play_reject()
            };
            break;
          case SessionState.Terminated:
            this.reset();
            this.emit({ type: 'phone:terminated', data: { cdr } });
            break;
        }
      });

      session.invite({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: { deviceId: { ideal: microphone } },
            video
          }
        },
        requestDelegate: {
          onReject: () => play_reject()
        }
      });

      RING_BACK.play();
      this.emit({ type: 'phone:ringing', data: { cdr } });
      this.setState({ session });
    } catch (err) {
      console.error(err);

      play_tone();
      this.reset();
    }
  };

  transfer = (opts = {}) => {
    try {
      const {
        session,
        dialer_number,
        show_blindTransfer,
        microphone,
        number_out,

        sipUri
      } = this.state;

      const {
        number = dialer_number,
        blind = show_blindTransfer,
        extraHeaders = [],
        video = false
      } = opts;

      const indentityHeaders = number_out
        ? [`P-Asserted-Identity:${number_out}`, `x-Number:${number_out}`]
        : [];

      const {
        raw: { host, port, scheme }
      } = UserAgent.makeURI(sipUri);
      const clean = cleanPhoneNumber(number);
      const target =
        UserAgent.makeURI(clean) ||
        UserAgent.makeURI(
          `${scheme}:${clean}@${host}${port ? `:${port}` : ''}`
        );
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
        session.bye();
        return;
      }

      const sessiont = new Inviter(this.ua, target, payload);

      const cdr = new Cdr({ session: sessiont });
      const contact = this.context
        .contacts()
        .contact_by_phone({ phone: cdr.to });
      cdr.setContact(contact);
      sessiont.cdr = cdr;

      sessiont.stateChange.addListener(state => {
        switch (state) {
          case SessionState.Established:
            RING_BACK.stop();
            this.setState({ rand: genId() });
            break;
          case SessionState.Terminated:
            RING_BACK.stop();

            this.setState({ sessiont: null }, () => {
              try {
                session?.unhold();
              } catch (err) {
                this.reset();
              }
            });
        }
      });

      RING_BACK.play();
      sessiont.invite({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: { deviceId: { ideal: microphone } },
            video
          }
        },
        requestDelegate: {
          onReject: () => play_reject()
        }
      });

      this.setState({ sessiont });
    } catch (err) {
      console.error(err);
      play_tone();
    }
  };

  reset = () => {
    const { session, sessiont } = this.state;
    sessiont?.bye();

    RING_TONE.stop();
    RING_BACK.stop();

    if (session && !(session instanceof Inviter)) play_reject();

    this.setState(this.defaults);
  };

  processRecording = ({ session }) => {
    const { webhooks } = this.state;
    if (!webhooks?.length) return;

    const type = 'audio/webm';

    const chunksBlob = chunks => {
      if (!chunks.length) return;

      return blobToDataURL(new Blob(chunks, { type }));
    };

    let recorder;
    const chunks = [];

    const streamIn = new MediaStream();
    let recorderIn;
    const chunksIn = [];

    const streamOut = new MediaStream();
    let recorderOut;
    const chunksOut = [];

    session.stateChange.addListener(state => {
      switch (state) {
        case SessionState.Established:
          try {
            const { peerConnection } = session.sessionDescriptionHandler;
            const audioContext = new AudioContext();
            const multi = audioContext.createMediaStreamDestination();

            const addTracks = (tracks, stream, recorder, chunks) =>
              tracks.forEach(({ track }) => {
                stream.addTrack(track);

                const src = audioContext.createMediaStreamSource(stream);
                src.connect(multi);

                recorder = new MediaRecorder(stream);
                recorder.ondataavailable = ({ data }) => chunks.push(data);
                recorder.start();
                recorder.tsStart = Date.now();
              });

            addTracks(
              peerConnection.getReceivers(),
              streamIn,
              recorderIn,
              chunksIn
            );
            addTracks(
              peerConnection.getSenders(),
              streamOut,
              recorderOut,
              chunksOut
            );

            recorder = new MediaRecorder(multi.stream, { mimeType: type });
            recorder.ondataavailable = ({ data }) => chunks.push(data);
            recorder.onstop = async () => {
              try {
                const id = session.cdr?.id;
                const blob = await chunksBlob(chunks);
                this.emit({
                  type: 'phone:recording',
                  data: { id, audio: { blob } }
                });

                const wav = async input => (await processAudio({ input })).wav;
                this.emit({
                  type: 'phone:audio',
                  data: {
                    id,
                    audio: {
                      remote: await wav(chunksIn),
                      local: await wav(chunksOut)
                    }
                  }
                });
              } catch (err) {
                console.error(err);
              }
            };

            recorder.start();
          } catch (err) {
            console.error(err);
          }

          break;
        case SessionState.Terminated:
          recorder?.stop();
          recorderIn?.stop();
          recorderOut?.stop();
          break;
      }
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
      if (ua) {
        state.status === 'offline' ? ua.stop() : ua.start();
      }
    }

    if (prevState.ringer !== state.ringer) {
      RING_TONE.setDevice(state.ringer);
    }
  }

  componentDidMount = async () => {
    this.unsubscribe = useStore.subscribe(state => {
      const {
        numbers = [],
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

        allowTransfer,
        allowBlindTransfer,
        allowVideo,
        allowAutoanswer,
        autoanswer,

        webhooks,

        contactsDialer: contacts,
        contactsDialerFilter: contactsFilter
      } = state;

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

        allowBlindTransfer,
        allowTransfer,
        allowVideo,
        allowAutoanswer,
        autoanswer,

        webhooks,

        contacts,
        contactsFilter
      });
    });

    this.click2CallHandler();
    this.networkHandler();
    this.startUADaemon();
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

      sipUser,
      sipUri = '',
      nickname,
      avatar,

      allowTransfer,
      allowBlindTransfer,
      allowVideo,

      contacts = {},
      contactsFilter
    } = this.state;

    const noConnection = !this.ua?.isConnected() || !network;
    const status_color = statuses.find(
      item => item.value === (noConnection ? 'offline' : status)
    )?.color;

    const callHandler = async (number, video) => {
      await this.call({ number, video });
    };

    const showTransferDialerHandler = async (blind = false) => {
      await session.hold();
      this.setState({ show_transfer: true, show_blindTransfer: blind });
    };

    const transferOnCancelHandler = async () => {
      await session.unhold();
      switch (sessiont?.state) {
        case SessionState.Initial:
        case SessionState.Establishing:
          sessiont.cancel();
          break;
        case SessionState.Established:
          sessiont.bye();
          break;
      }

      this.setState({ show_transfer: false });
    };

    const transferHandler = number => {
      this.setState({ show_transfer: false }, async () => {
        await this.transfer({ number });
      });
    };

    const transferConfirmHandler = () => {
      session.refer(sessiont);
      session.bye();
    };

    const onNumberChangeHandler = number_out =>
      this.context.setSettings({ number_out });

    const contactClickHandler = contact =>
      this.emit({ type: 'contact:click', data: { contact } });

    const [sipUriName] = sipUri.replace('sip:', '').split('@');
    const displayName = nickname || sipUser || sipUriName || '';

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, marginTop: 10 }}>
          <Header
            numbers={numbers}
            number_out={number_out}
            onChange={onNumberChangeHandler}
            name={displayName}
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
          {...session}
          key={session?.id}
          session={session}
          hold={session?._hold}
          visible={!_.isEmpty(session)}
          onCancel={this.hangup}
          onAccept={this.answer}
          onTransfer={() => showTransferDialerHandler(false)}
          onBlindTransfer={() => showTransferDialerHandler(true)}
          onContactClick={contactClickHandler}
          allowTransfer={allowTransfer}
          allowBlindTransfer={allowBlindTransfer}
        />

        <SessionScreen
          key={sessiont?.id}
          session={sessiont}
          visible={!_.isEmpty(sessiont)}
          onCancel={transferOnCancelHandler}
          onAccept={transferConfirmHandler}
          isTransfer={true}
        />

        <Screen
          visible={show_transfer}
          closeable
          onClose={transferOnCancelHandler}
          style={{ paddingTop: 30 }}
        >
          <Dialer
            testID="transferDialer"
            isTransfer={true}
            onDialClick={transferHandler}
            onCdrClick={transferHandler}
            onContactClick={(phones = []) => transferHandler(phones[0])}
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
