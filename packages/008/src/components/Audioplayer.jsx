import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

export const AudioPlayer = ({ session }) => {
  const ref = useRef(null);

  useEffect(() => {
    session?.on('accepted', () => {
      const stream = new MediaStream();
      const { peerConnection } = session.sessionDescriptionHandler;
      peerConnection.getReceivers().forEach(({ track }) => {
        if (track) stream.addTrack(track);
      });

      const elem = ref.current;
      elem.srcObject = stream;
    });
  }, [session?.id]);

  if (!session) return null;

  if (session.isVideo())
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }} >
        <video ref={ref} autoPlay style={{ width: '100%', height: '100%' }} />
      </View>
    )
  
  return <audio ref={ref} autoPlay />
};
