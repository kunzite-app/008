import { View } from 'react-native';
import { SessionScreen } from '../src/screens/SessionScreen';
import { SessionState } from '../src/Sip';

export default {
  title: 'Screens/SessionScreen',
  component: SessionScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

const contact = {
  id: 'id1',
  name: 'John Doe',
  phones: ['+34666555444'],
  avatar: 'https://avatars.githubusercontent.com/u/414967'
};
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
};

const sharedArgs = {
  visible: true,
  onAccept: () => console.log('accepting'),
  onCancel: () => console.log('canceling'),
  onContactClick: () => console.log('contact click')
};

const Template = props => (
  <View style={{ width: 350, height: 500 }}>
    <SessionScreen {...props} />
  </View>
);

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
  }
};

export const InboundAnswered = args => <Template {...args} />;
InboundAnswered.args = {
  ...sharedArgs,
  session: {
    ...mockSession,
    status: SessionState.Established,
    isInbound: () => true,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2',
      direction: 'inbound'
    }
  }
};

export const Outbound = args => <Template {...args} />;
Outbound.args = {
  ...sharedArgs,
  session: {
    ...mockSession,
    status: SessionState.Establishing,
    isInbound: () => false,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2'
    }
  }
};

export const OutboundAnswered = args => <Template {...args} />;
OutboundAnswered.args = {
  ...sharedArgs,
  session: {
    ...mockSession,
    status: SessionState.Established,
    isInbound: () => true,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2'
    }
  }
};

export const OutboundVideoAnswered = args => <Template {...args} />;
OutboundVideoAnswered.args = {
  ...sharedArgs,
  session: {
    ...mockSession,
    status: SessionState.Established,
    isInbound: () => true,
    isVideo: () => true,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2'
    }
  }
};

export const AttendedTransfer = args => <Template {...args} />;
AttendedTransfer.args = {
  ...sharedArgs,
  isTransfer: true,
  session: {
    ...mockSession,
    status: SessionState.Established,
    isInbound: () => false,
    cdr: {
      contact,
      from: 'agent1',
      to: 'agent2'
    }
  }
};
