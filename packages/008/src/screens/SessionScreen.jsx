import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Screen } from './Screen';
import { AudioPlayer } from '../components/Audioplayer';
import { ButtonIcon, CancelAccept } from '../components/Basics';
import { DialGrid } from '../components/Dialer';
import { CallInfo, ContactDetails } from '../components/Phone/Components';
import { useStore } from '../store/Context';

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
  closeable,

  session,

  onAccept,
  onCancel,

  transferAllowed = true,
  blindTransferAllowed = true,
  onTransfer,
  onBlindTransfer,
  onContactClick
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

  const holdHandler = (ishold) => {
    if (ishold) session?.hold();
    else session?.unhold();

    setHold(ishold);
  }

  useEffect(() => {
    session?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    session?.setMutedVideo(mutedVideo);
  }, [mutedVideo]);

  if (!session) return null;

  const { cdr: { from, to, contact } } = session;
  const isVideo = session.isVideo();
  const inbound = session.isInbound();

  return (
    <Screen closeable={closeable} visible={visible}>
      <AudioPlayer session={session} speaker={speaker} />

      <View style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'space-between', position: 'absolute' }}>
        <CallInfo
          number={inbound ? to : from}
          inbound={inbound}
          timer={session?.hasAnswer}
        />

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

        {session?.hasAnswer && (
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
                onClick={() => holdHandler(!hold)}
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
        )}

        <CancelAccept 
          onAccept={onAccept} 
          onCancel={onCancel}
        />
        
      </View>
    </Screen>
  );
};
