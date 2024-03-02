import { useReducer, useState } from 'react';
import { View } from 'react-native';

import { SessionState } from 'sip.js';

import { Screen } from './Screen';
import { Player } from '../components/Player';
import { COLORS, CallIcon, CancelAccept, CancelAcceptCall, Link, RoundIconButton, Text } from '../components/Basics';
import { DialGrid } from '../components/Dialer';
import { useStore } from '../store/Context';
import Timer from '../components/Timer';
import { ContactAvatar } from '../components/Avatars';

const CallButton = ({ style, size = 40, iconSize = 20, ...props }) => {
  return (
  <RoundIconButton 
    {...props}
    size={size} 
    iconSize={iconSize}
    style={{ backgroundColor: `${COLORS.app}90`,  ...style }} 
  />)
}

export const SessionScreen = ({
  visible,

  session,

  onAccept,
  onCancel,
  onContactClick,

  isTransfer,
  allowTransfer = true,
  allowBlindTransfer = true,
  onTransfer,
  onBlindTransfer,
}) => {
  const { speaker } = useStore();
  const [showDialer, setShowDialer] = useState(false);
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  if (!session) return null;
  
  const dialHandler = key => session.dtmf(key);

  const holdHandler = async () => {
    await session.setHold(!session._hold);
    forceUpdate();
  }

  const muteHandler = () => {
    session.setMuted(!session._muted);
    forceUpdate();
  }

  const muteVideoHandler = () => {
    session.setMutedVideo(!session._mutedVideo);
    forceUpdate();
  }

  session.stateChange.addListener((state) => {
    if(state === SessionState.Established) {
      // needs a delay to avoid reinvite exceptions
      setTimeout(() => {
        session.setHold(session._hold);
        session.setMuted(session._muted);
        session.setMutedVideo(session._mutedVideo);
      }, 100);
    }
  });

  const { cdr: { from, to, contact } = {} } = session;
  const isVideo = session.isVideo();
  const number = session.isInbound() ? from : to || contact?.phones?.[0] || '';
  const established = session.state === SessionState.Established;

  return (
    <Screen closeable={false} visible={visible}>
      {established &&
        <Player stream={session.getStream()} speaker={speaker} isvideo={session.isVideo()} />
      }

      <View style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'space-between', position: 'absolute' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 5
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignContent: 'center', width: 80, backgroundColor: COLORS.secondary, padding: 5, borderRadius: 15 }}>
            <CallIcon call={session.cdr} color="white" size={14} />

            {established && <Timer style={{ color: 'white' }} />}
          </View>
        </View>

        <View
          style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}
        >
          {showDialer ? (
            <DialGrid onPress={dialHandler} style={{ backgroundColor: '#ffffff80', borderRadius: 30 }} />
          ) : (!isVideo &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
              <ContactAvatar size={100} contact={contact} />

              {contact?.name &&
                <Link onClick={() => onContactClick?.(contact)} style={{ fontSize: 20, marginTop: 10 }}>
                  {contact.name}
                </Link>
              } 

              <Text style={{ fontSize: 20, marginTop: contact?.name ? 5 : 10 }}>{number}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}
          >
            <CallButton 
              icon={showDialer ? 'user' : 'grid'} 
              onClick={() => setShowDialer(!showDialer)} 
            />

            <CallButton
              iconColor={session._muted ? 'danger' : undefined}
              icon="micOff"
              onClick={muteHandler}
            />
            
            {isVideo &&
              <CallButton
                iconColor={session._mutedVideo ? 'danger' : undefined}
                icon="video"
                onClick={muteVideoHandler}
              />
            }
            
            <CallButton
              icon={session._hold ? 'play' : 'pause'}
              onClick={holdHandler}
            />
          </View>

          {((established && !isTransfer) && (allowTransfer || allowBlindTransfer)) && (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
              {allowTransfer && (
                <CallButton
                  icon="phoneForwarded" 
                  onClick={onTransfer} 
                />
              )}

              {allowBlindTransfer && (
                <View style={{ marginLeft: 30, }}>
                  <CallButton
                    testID="blindTransferButton"
                    iconColor="danger"
                    icon="phoneForwarded"
                    onClick={onBlindTransfer}
                  />
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={{ marginBottom: 20 }} >
          {isTransfer ?
            <CancelAccept
              onAccept={onAccept} 
              onCancel={onCancel}
              cancelTestID="hangupButton"
              acceptTestID="acceptCallButton"
            /> :
            <CancelAcceptCall
              onAccept={session?.isInbound() && !established ? onAccept : null} 
              onCancel={onCancel}
              cancelTestID="hangupButton"
              acceptTestID="acceptCallButton"
            />
          }
        </View>
      </View>
    </Screen>
  );
};
