import { CancelAccept } from '../src/components/Basics';

export default {
  component: CancelAccept,
  title: 'Components/CancelAccept'
};

export const Default = args => <CancelAccept {...args} />;
Default.args = {
  onCancel: () => console.log('Canceled'),
  onAccept: () => console.log('Accepted')
};

export const CancelOnly = args => <CancelAccept {...args} />;
CancelOnly.args = {
  onCancel: () => console.log('Canceled')
};

export const AcceptOnly = args => <CancelAccept {...args} />;
AcceptOnly.args = {
  onAccept: () => console.log('Accepted')
};
