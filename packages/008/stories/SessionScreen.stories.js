import { View } from 'react-native';
import { SessionScreen } from '../src/screens/SessionScreen';

export default {
  title: 'Screens/SessionScreen',
  component: SessionScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

const contact = { id: 'id1', name: 'John Doe', phones: ['+34666555444'] };
const mockSession = {
  unhold: () => console.log('calling unhold'),
  hold: () => console.log('calling hold'),
  mute: () => console.log('calling mute'),
  dtmf: () => console.log('calling dftm'),
  setMuted: () => console.log('muting...'),
  setMutedVideo: () => console.log('muting video...'),
  on: () => console.log('calling event'),
  isVideo: () => false,
  
  isInbound: () => true,
  cdr: {
    contact,
    from: 'agent1',
    to: 'agent2',
    direction: 'inbound'
  }
}

const sharedArgs = {
  visible: true,
  onAccept: () => console.log('accepting'),
  onCancel: () => console.log('canceling'),
  onContactClick: () => console.log('contact click'),
}

const Template = (props) => (
  <View style={{ width: 350, height: 500 }}>
    <SessionScreen {...props} />
  </View>
)

export const Inbound = args => <Template {...args} />;
Inbound.args = {
  ...sharedArgs,
  session: {
    ...mockSession,
    isInbound: () => true,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2',
      direction: 'inbound'
    }
  },
};

export const InboundAnswered = args => <Template {...args} />;
InboundAnswered.args = {
  ...sharedArgs,
  session: {
    ...mockSession,
    hasAnswer: true,
    isInbound: () => true,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2',
      direction: 'inbound'
    },
  },
};

export const Outbound = args => <SessionScreen {...args} />;
Outbound.args = {
  visible: true,

  session: {
    unhold: () => console.log('calling unhold'),
    hold: () => console.log('calling hold'),
    mute: () => console.log('calling mute'),
    dtmf: () => console.log('calling dftm')
  },

  inbound: false,
  onCancel: () => console.log('canceling'),
  onTransfer: () => console.log('calling transfer'),
  onBlindTransfer: () => console.log('calling blind transfer'),

  label: 'Lorem ipsum dolor',
  call_number: '+34999999999',
  contact,
  onContactClick: console.log('contact click')
};

export const OutboundAnswered = args => <SessionScreen {...args} />;
OutboundAnswered.args = {
  visible: true,

  session: {
    unhold: () => console.log('calling unhold'),
    hold: () => console.log('calling hold'),
    mute: () => console.log('calling mute'),
    dtmf: () => console.log('calling dftm'),
    hasAnswer: true
  },

  inbound: false,
  onCancel: () => console.log('canceling'),
  onTransfer: () => console.log('calling transfer'),
  onBlindTransfer: () => console.log('calling blind transfer'),

  label: 'Lorem ipsum dolor',
  call_number: '+34999999999',
  contact,
  onContactClick: console.log('contact click')
};

export const Transfer = args => <SessionScreen {...args} />;
Transfer.args = {
  visible: true,

  session: {
    unhold: () => console.log('calling unhold'),
    hold: () => console.log('calling hold'),
    mute: () => console.log('calling mute'),
    dtmf: () => console.log('calling dftm')
  },

  inbound: false,
  onCancel: () => console.log('canceling'),
  transferAllowed: false,
  blindTransferAllowed: false,

  label: 'Lorem ipsum dolor',
  call_number: '+34999999999',
  contact,
  onContactClick: console.log('contact click')
};

export const TransferAnswered = args => <SessionScreen {...args} />;
TransferAnswered.args = {
  visible: true,

  session: {
    unhold: () => console.log('calling unhold'),
    hold: () => console.log('calling hold'),
    mute: () => console.log('calling mute'),
    dtmf: () => console.log('calling dftm'),
    hasAnswer: true
  },

  inbound: false,
  onAccept: () => console.log('accepting'),
  onCancel: () => console.log('canceling'),
  transferAllowed: false,
  blindTransferAllowed: false,

  label: 'Lorem ipsum dolor',
  call_number: '+34999999999',
  contact,
  onContactClick: console.log('contact click')
};
