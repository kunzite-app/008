import { DialPad } from '../src/components/Dialer';

export default {
  component: DialPad,
  title: 'Components/DialPad'
};

export const Default = args => <DialPad {...args} />;
Default.args = {
  onClick: number => console.log(number)
};

export const WithValues = args => <DialPad {...args} />;
WithValues.args = {
  number: '+34 666 777 888',
  onClick: number => console.log(number)
};
