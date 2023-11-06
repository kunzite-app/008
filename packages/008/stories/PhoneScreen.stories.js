import { PhoneScreen } from '../src/screens';

export default {
  title: 'Screens/PhoneScreen',
  component: PhoneScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default = args => <PhoneScreen {...args} />;
