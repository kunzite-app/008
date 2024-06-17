import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { registerGlobals, RTCView } from 'react-native-webrtc-web-shim';

export const Player = ({ stream, speaker, isvideo }) => {
  const ref = useRef(null);

  useEffect(() => {
    registerGlobals();
  }, []);

  /*
  useEffect(() => {
    const elem = ref.current;
    elem.srcObject = stream;
    elem.setSinkId(speaker);
  }, [stream, speaker]);
  */

  return <RTCView objectFit={'cover'} stream={stream} zOrder={0} />

  if (isvideo)
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }} >
        <video ref={ref} autoPlay style={{ width: '100%', height: '100%' }} />
      </View>
    )
  
  return <audio ref={ref} autoPlay />
};
