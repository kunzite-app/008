import { SessionScreen } from '../src/screens/SessionScreen';

export default {
  title: 'Screens/SessionScreen',
  component: SessionScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

const contact = { id: 'id1', name: 'John Doe', phones: ['+34666555444'] };

export const Inbound = args => <SessionScreen {...args} />;
Inbound.args = {
  visible: true,

  session: {
    unhold: () => console.log('calling unhold'),
    hold: () => console.log('calling hold'),
    mute: () => console.log('calling mute'),
    dtmf: () => console.log('calling dftm')
  },

  inbound: true,
  onAccept: () => console.log('accepting'),
  onCancel: () => console.log('canceling'),

  label: 'Lorem ipsum dolor',
  call_number: '+34999999999',
  contact,
  onContactClick: console.log('contact click')
};

export const InboundAnswered = args => <SessionScreen {...args} />;
InboundAnswered.args = {
  visible: true,

  session: {
    unhold: () => console.log('calling unhold'),
    hold: () => console.log('calling hold'),
    mute: () => console.log('calling mute'),
    dtmf: () => console.log('calling dftm'),
    hasAnswer: true
  },

  inbound: true,
  onCancel: () => console.log('canceling'),
  onTransfer: () => console.log('calling transfer'),
  onBlindTransfer: () => console.log('calling blind transfer'),

  label: 'Lorem ipsum dolor',
  call_number: '+34999999999',
  contact,
  onContactClick: console.log('contact click')
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
