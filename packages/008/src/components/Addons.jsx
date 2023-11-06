import { View } from 'react-native';

export const AddonsIframe = ({ width, height, url }) => {
  return (
    <View
      style={{
        flex: !width || !height ? 1 : undefined,
        height,
        width,
        paddingLeft: 10
      }}
    >
      <iframe
        name="addon"
        src={url}
        style={{ overflow: 'hidden', height: '100vh', width: '100%' }}
        frameBorder="0"
      />
    </View>
  );
};
