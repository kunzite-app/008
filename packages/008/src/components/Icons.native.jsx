import { Image } from 'react-native';
import FiIcon from 'react-native-vector-icons/Feather';

const q = require('../../web/assets/icons/008.png');

export const Icon = ({ icon, ...props }) => {
  const { size } = props;
  if (icon === 'q') return <Image source={q} style={{ width: size, height: size }} />
  return <FiIcon {...props} name={icon} />;
}
