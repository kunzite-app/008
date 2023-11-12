import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

export const AudioPlayer = ({ session, speaker }) => {
  const ref = useRef(null);

  useEffect(() => {
    session?.on('accepted', () => {
      const stream = session.getStream();
      const elem = ref.current;
      elem.srcObject = stream;
      elem.setSinkId(speaker)
    });
  }, [session?.id, speaker]);

  if (!session) return null;

  if (session.isVideo())
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }} >
        <video ref={ref} autoPlay style={{ width: '100%', height: '100%' }} />
      </View>
    )
  
  return <audio ref={ref} autoPlay />
};
