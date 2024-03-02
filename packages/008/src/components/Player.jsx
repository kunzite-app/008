import { useEffect, useRef } from 'react';
import { View } from 'react-native';

export const Player = ({ stream, speaker, isvideo }) => {
  const ref = useRef(null);

  useEffect(() => {
    const elem = ref.current;
    elem.srcObject = stream;
    elem.setSinkId(speaker);
  }, [stream, speaker]);

  if (isvideo)
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }} >
        <video ref={ref} autoPlay style={{ width: '100%', height: '100%' }} />
      </View>
    )
  
  return <audio ref={ref} autoPlay />
};
