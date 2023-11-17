import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Screen } from './Screen';
import { AudioPlayer } from '../components/Audioplayer';
import { ButtonIcon, COLORS, CallIcon, CancelAccept, CancelAcceptCall, Text } from '../components/Basics';
import { DialGrid } from '../components/Dialer';
import { ContactDetails } from '../components/Phone/Components';
import { useStore } from '../store/Context';
import Timer from '../components/Timer';

const Round = ({ children }) => {
  const size = 30;
  return (
  <View style={{ 
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: size / 2,
    backgroundColor: '#ffffff80'}}>
    {children}
  </View>
  )
}

export const SessionScreen = ({
  visible,

  session,

  onAccept,
  onCancel,
  onContactClick,

  transferAllowed = true,
  blindTransferAllowed = true,
  onTransfer,
  onBlindTransfer,
  isTransfer
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
  const inbound = session.isInbound();

  return (
    <Screen closeable={false} visible={visible}>
      <AudioPlayer session={session} speaker={speaker} />

      <View style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'space-between', position: 'absolute' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 5,
            backgroundColor: '#ffffff80',
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
            <ContactDetails
              number={inbound ? from : to}
              contact={contact}
              onClick={onContactClick}
            />
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
          <Round>
            <ButtonIcon
              color="primary"
              icon={showDialer ? 'user' : 'grid'}
              onClick={() => setShowDialer(!showDialer)}
            />
          </Round>
          
          <Round>
            <ButtonIcon
              color={muted ? 'danger' : 'primary'}
              icon="micOff"
              onClick={() => setMuted(!muted)}
            />
          </Round>

          
          {isVideo &&
          <Round>
            <ButtonIcon
              color={mutedVideo ? 'danger' : 'primary'}
              icon="video"
              onClick={() => setMutedVideo(!mutedVideo)}
            />
          </Round>
          }
          
          <Round>
            <ButtonIcon
              color="primary"
              icon={hold ? 'play' : 'pause'}
              onClick={() => setHold(!hold)}
            />
          </Round>

          {(transferAllowed || blindTransferAllowed) && (
            <View style={{ flexDirection: 'row' }}>
              {transferAllowed && (
                <Round>
                  <ButtonIcon
                    color="primary" 
                    icon="phoneForwarded" 
                    onClick={onTransfer} 
                  />
                </Round>
              )}

              {blindTransferAllowed && (
                <Round>
                  <ButtonIcon
                    color="danger"
                    icon="phoneForwarded"
                    onClick={onBlindTransfer}
                  />
                </Round>
              )}
            </View>
          )}
        </View>
        
        {isTransfer ?
          <CancelAccept
            onAccept={onAccept} 
            onCancel={onCancel}
          /> :
           <CancelAcceptCall
            onAccept={onAccept} 
            onCancel={onCancel}
          />
        }
      </View>
    </Screen>
  );
};
