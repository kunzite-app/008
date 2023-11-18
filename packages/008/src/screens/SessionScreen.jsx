import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Screen } from './Screen';
import { AudioPlayer } from '../components/Audioplayer';
import { COLORS, CallIcon, CancelAccept, CancelAcceptCall, Link, RoundIconButton, Text } from '../components/Basics';
import { DialGrid } from '../components/Dialer';
import { useStore } from '../store/Context';
import Timer from '../components/Timer';
import { ContactAvatar } from '../components/Avatars';

const CallButton = ({ style, size = 40, iconSize = 20, ...props }) => 
  <RoundIconButton {...props} size={size} iconSize={iconSize}
    style={{ backgroundColor: `${COLORS.app}90`,  ...style }} 
  />

export const SessionScreen = ({
  visible,

  session,

  onAccept,
  onCancel,
  onContactClick,

  isTransfer,
  transferAllowed = true,
  blindTransferAllowed = true,
  onTransfer,
  onBlindTransfer,
}) => {
  
  const store = useStore();
  const {
    speaker
  } = store;

  const [showDialer, setShowDialer] = useState(false);
  const [hold, setHold] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);

  const dialHandler = key => session.dtmf(key);

  const holdHandler = () => {
    try {
      if (hold) session?.hold();
      else session?.unhold();
    } catch(err){ console.error(err) };
  }

  const muteHandler = () => {
    try { 
      session?.setMuted(muted) 
    } catch(err){ console.error(err) };
  }

  const muteVideoHandler = () => {
    try { 
      session?.setMutedVideo(mutedVideo) 
    } catch(err){ console.error(err) };
  }

  useEffect(() => {
    holdHandler();
  }, [hold]);

  useEffect(() => {
    muteHandler();
  }, [muted]);

  useEffect(() => {
    muteVideoHandler();
  }, [mutedVideo]);
  
  if (!session) return null;

  session?.on('accepted', () => {
    holdHandler();
    muteHandler();
    muteVideoHandler();
  });

  const { cdr: { from, to, contact } } = session;
  const isVideo = session.isVideo();
  const number = session.isInbound() ? from : to || contact?.phones?.[0] || '';

  return (
    <Screen closeable={false} visible={visible}>
      <AudioPlayer session={session} speaker={speaker} />

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
            <CallIcon call={session.cdr} color="white" size={12} />

            {session?.hasAnswer && <Timer style={{ color: 'white' }} />}
          </View>
        </View>

        <View
          style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}
        >
          {showDialer ? (
            <DialGrid onPress={dialHandler} style={{ backgroundColor: '#ffffff80', borderRadius: 30 }} />
          ) : (!isVideo &&
            <View
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              focusable={false}
            >
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

        <View
          focusable={false}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around'
          }}
        >
          <CallButton 
            icon={showDialer ? 'user' : 'grid'} 
            onClick={() => setShowDialer(!showDialer)} 
          />

          <CallButton
            iconColor={muted ? 'danger' : null}
            icon="micOff"
            onClick={() => setMuted(!muted)}
          />
          

          {isVideo &&
            <CallButton
              iconColor={mutedVideo ? 'danger' : null}
              icon="video"
              onClick={() => setMutedVideo(!mutedVideo)}
            />
          }
          
          <CallButton
            icon={hold ? 'play' : 'pause'}
            onClick={() => setHold(!hold)}
          />
        </View>

        {((session.hasAnswer) && (transferAllowed || blindTransferAllowed)) && (
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
            {transferAllowed && (
              <CallButton
                icon="phoneForwarded" 
                onClick={onTransfer} 
              />
            )}

            {blindTransferAllowed && (
              <View style={{ marginLeft: 30, }}>
                <CallButton
                  iconColor="danger"
                  icon="phoneForwarded"
                  onClick={onBlindTransfer}
                />
              </View>
            )}
          </View>
        )}
        
        <View style={{ marginBottom: 20 }} >
          {isTransfer ?
            <CancelAccept
              onAccept={onAccept} 
              onCancel={onCancel}
            /> :
            <CancelAcceptCall
              onAccept={session?.isInbound() && !session?.hasAnswer ? onAccept : null} 
              onCancel={onCancel}
            />
          }
        </View>
      </View>
    </Screen>
  );
};
