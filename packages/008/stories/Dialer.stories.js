import { Dialer } from '../src/components/Dialer';

export default {
  title: 'Components/Dialer',
  component: Dialer,
  parameters: {
    layout: 'fullscreen'
  }
};

export const Default = args => <Dialer {...args} />;
Default.args = {
  number: '666666666',
  onDialClick: number => console.log(number),

  onContactsFilterChange: filter => console.log(filter),
  onContactClick: phones => console.log(phones),
  contacts: {
    hits: [
      { id: 'id1', name: '', phones: ['+34666555444'] },
      {
        id: 'id2',
        name: 'Jennifer Doe',
        phones: ['+34666555444', '+34666777888']
      }
    ],
    total: 2
  },

  onCdrClick: number => console.log(number),
  cdrs: [
    {
      id: '1',
      date: '2023-07-27T18:27:00.708Z',
      from: '+34666999999',
      to: '+34666555444',
      direction: 'inbound',
      status: 'answered'
    },
    {
      id: '2',
      date: '2023-07-27T18:26:00.708Z',
      from: '+34666999999',
      to: '+34666555444',
      direction: 'inbound',
      status: 'missed'
    },
    {
      id: '3',
      date: '2023-07-27T18:25:00.708Z',
      from: '+34666555444',
      to: '+34666999999',
      direction: 'outbound',
      status: 'missed'
    },
    {
      id: '4',
      date: '2023-07-27T18:23:39.708Z',
      from: '+34666555444',
      to: '+34666777888',
      direction: 'outbound',
      status: 'answered'
    }
  ]
};
