import _ from 'lodash';
import { Fragment, useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Screen } from './Screen';
import { COLORS, Status , ButtonIcon, HRule, Select, CancelAccept, Button, Text, Switch } from '../components/Basics';
import { FormRow, InputRow } from '../components/Forms';
import {
  AnchorIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UnanchorIcon,
  XIcon
} from '../components/Icons';
import { EventsList, WebhooksList } from '../components/Lists';

import { useStore } from '../store/Context';

import { readFileAsText } from '../utils';

const SelectDevice = ({ devices, deviceId, onChange }) => (
  <Select
    tabIndex="-1"
    options={devices.map(({ deviceId, label }) => {
      return { value: deviceId, text: label };
    })}
    value={deviceId}
    onChange={onChange}
  />
)

const Title = ({ children, style }) => (
  <Text
    style={[{ fontSize: 20, fontWeight: 'bold', paddingBottom: 10 }, style]}
  >
    {children}
  </Text>
);

const RowLink = ({ onClick, text, iconSize = 15 }) => {
  const icons = {
    anchor: <AnchorIcon size={iconSize} />,
    unanchor: <UnanchorIcon size={iconSize} />,
    quit: <XIcon size={iconSize} />,
  };
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15
      }}
    >
      <div>{icons[text.toLowerCase()]}</div>
      <Text style={{ paddingLeft: 5 }} onClick={onClick}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export const ExitForm = () => {
  const {
    electron,
    setSettings,
    anchored
  } = useStore();
  
  if (!electron) return null;

  return (
    <View>
      <RowLink onClick={() => setSettings({ anchored: !anchored })}
        text={!anchored ? 'Anchor' : 'Unanchor'}
      />
      <HRule />
      <RowLink onClick={() => setSettings({ doquit: true })} text="Quit" />
      <HRule />
    </View>
  );
};

export const DangerZone = ({ style }) => {
  const {
    clear
  } = useStore();

  return (
    <View style={ style }>
      <Title style={{ fontSize: 14, color: 'red' }}>Danger Zone</Title>
      <Button 
        color='danger' 
        onClick={clear}
      >
        <Text style={{ color: 'white' }}>Clear all</Text>
      </Button>
    </View>
  )
}

const StatusText = ({ text, color } = {}) => (
  <View style={{ flex: 1, flexDirection: 'row' }}>
    <View
      style={{
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Status color={color} />
    </View>
    <Text>{text}</Text>
  </View>
)

export const StatusForm = (props) => {
  const { style, onChange, ...initialValues } = props
  const [values, setValues] = useState(initialValues);

  const setValue = (field, value) => {
    const val = { ...values };
    val[field] = value;

    setValues(val);
    onChange?.(val);
  };

  useEffect(() => {
    if (!_.isEqual(initialValues, values)) setValues(initialValues);
  }, [initialValues]);

  const { statuses = [], status } = values;
  const { color } = statuses?.find(({ value }) => value === status) || {};
  return (
    <View style={style}>
      {statuses?.length > 0 && (
        <FormRow label={'Status'}>
          <Select
            prepend={
              <View
                style={{
                  paddingLeft: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Status color={color} />
              </View>
            }
            options={statuses}
            value={status}
        
            renderCustomizedButtonChild={(item) => {
              const status = statuses.find(status => status.value === item?.value)
              return <StatusText { ...status }/>
            }}
            renderCustomizedRowChild={(_, idx) => <StatusText { ...statuses[idx] } />}
            onChange={val => setValue('status', val)}
          />
        </FormRow>
      )}
    </View>
  );
};

export const ConnectionForm = ({ onChange, ...initialValues }) => {
  const [values, setValues] = useState(initialValues);
  const [isBasicAuthEnabled, setIsBasicAuthEnabled] = useState(false);

  const setValue = (field, value) => {
    const val = { ...values };
    val[field] = value;

    setValues(val);
    onChange?.(val);
  };

  useEffect(() => {
    if (!_.isEqual(initialValues, values)) setValues(initialValues);
  }, [initialValues]);

  const {
    settingsUri = '',
    nickname = '',
    password = '',
  } = values;

  return (
    <View>
      <InputRow
        data-test="settingsUri"
        label={'Settings'}
        placeholder="https://example.com/settings"
        value={settingsUri}
        onChange={val => setValue('settingsUri', val)}
      />

      <TouchableOpacity
        style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => setIsBasicAuthEnabled(!isBasicAuthEnabled)}
      >
        <Text style={{ fontSize: 12 }}>Basic Auth</Text>

        {isBasicAuthEnabled ? < ChevronDownIcon /> : <ChevronRightIcon /> }
      </TouchableOpacity>
        
      {isBasicAuthEnabled && (
        <>
          <InputRow
            label={'User'}
            placeholder="JohnDoe"
            value={nickname}
            onChange={val => setValue('nickname', val)}
          />

          <InputRow
            label={'Password'}
            secureTextEntry
            placeholder="********"
            value={password}
            onChange={val => setValue('password', val)}
          />
        </>
      )}
    </View>
  );
};

export const DevicesForm = (props) => {
  const { style, onChange, ...initialValues } = props
  const [values, setValues] = useState(initialValues);

  const setValue = (field, value) => {
    const val = { ...values };
    val[field] = value;

    setValues(val);
    onChange?.(val);
  };

  useEffect(() => {
    if (!_.isEqual(initialValues, values)) setValues(initialValues);
  }, [initialValues]);

  const { devices = [], microphones = [], ringer, microphone, speaker } = values;
  return (
    <View style={style}>
      <FormRow label={'Speakers'}>
        <SelectDevice devices={devices} deviceId={speaker} onChange={(val) => setValue('speaker', val)} />
      </FormRow>

      <FormRow label={'Microphone'}>
        <SelectDevice devices={microphones} deviceId={microphone} onChange={(val) => setValue('microphone', val)} />
      </FormRow>

      <FormRow label={'Ringer'}>
        <SelectDevice devices={devices} deviceId={ringer} onChange={(val) => setValue('ringer', val)} />
      </FormRow>
    </View>
  );
};

export const ContactsForm = () => {
  const { contacts } = useStore();

  const onDragOver = ev => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  const onDrop = async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const { files } = ev.dataTransfer;
    const [file] = files;
    const vcf = await readFileAsText(file);
    contacts().index({ vcf });
  };

  return (
    <View style={{ flex: 1 }}>
      <FormRow label={'Import VCF'}>
      <div
        draggable
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 100,
          border: 2,
          borderStyle: 'dashed',
          borderColor: COLORS.borderColor,
          backgroundColor: COLORS.backColor,
          padding: 5
        }}
      >
        <Text style={{ textAlign: 'center' }}>
          Drop here your VCF file to add your contacts
        </Text>
      </div>
    </FormRow>
    </View>
  );
};

export const QView = () => {
  const store = useStore();
  const {
    setSettings,

    qTts,
    qSummarization,
    events,

    server
  } = store;

  return (
    <View style={{ flex: 1 }}>
      <Title>008Q</Title>
      <View style={{ flexDirection: 'row',  justifyContent: 'space-between', padding: 5 }}>
        <Text>Server Only</Text>
        <Switch value={server} onValueChange={(val) => setSettings({ server: val })} />
      </View>

      <HRule />
      
      <View style={{ flexDirection: 'row',  justifyContent: 'space-between', padding: 5 }}>
        <Text>Transcribe</Text>
        <Switch value={qTts} onValueChange={() => {
          const value = !qTts;
          value ? setSettings({ qTts: value }) : setSettings({ qTts: false, qSummarization: false })
        }} />
      </View>
      <View style={{ flexDirection: 'row',  justifyContent: 'space-between', padding: 5 }}>
        <Text>Summarize</Text>
        <Switch value={qSummarization} onValueChange={() => setSettings({ qSummarization: !qSummarization })} />
      </View>
      <HRule />
      <View style={{ flex: 1 }}>
        <EventsList data={events} />
      </View>
    </View>
  )
}

export const SettingsScreen = ({ visible = false, closeable = true }) => {
  const store = useStore();
  const {
    settingsUri,
    nickname,
    password,
    login,

    setSettings,
    toggleShowSettings,
    settingsTab = 'user',

    webhooks,
    
    server,
  } = store;

  const [option, setOption] = useState(settingsTab);

  const [connection, setConnection] = useState({
    settingsUri,
    nickname,
    password,
  });

  useEffect(() => {
    setOption(settingsTab);
  }, [settingsTab]);

  useEffect(() => {
    setConnection({ settingsUri, nickname, password });
  }, [settingsUri, nickname, password]);

  const onChangeSettingsHandler = input => {
    setSettings(input);
  };

  const onChangeConnectionHandler = input => {
    setConnection(input);
  };

  const content = {
    user: (
      <View style={{ flex: 1 }}>
        {!server &&
          <Fragment>
            <StatusForm {...store} onChange={onChangeSettingsHandler} />
            <HRule />
          </Fragment>
        }

        <ExitForm />
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <DangerZone />
        </View>
      </View>
    ),
    connection: (
      <View style={{ flex: 1 }}>
        <Title>Connection</Title>
        <View style={{ flex: 1 }}>
            <ConnectionForm 
              {...store}
              {...connection}
              onChange={onChangeConnectionHandler}
            />
          </View>

          <CancelAccept
            onCancel={() => {
              setConnection({
                settingsUri,
                nickname,
                password
              });
            }}
            onAccept={() => {
              try {
                login(connection);
              } catch(err) {
                console.log(err);
              }
            }}
            acceptTestID="settingsAccept"
          />
        
      </View>
    ),
    devices: (
      <View style={{ flex: 1 }}>
        <Title>Devices</Title>
        <DevicesForm {...store} onChange={onChangeSettingsHandler} />
      </View>
    ),
    contacts: (
      <View style={{ flex: 1 }}>
        <Title>Contacts</Title>
        <ContactsForm />
      </View>
    ),
    webhooks: (
      <View style={{ flex: 1 }}>
        <Title>Webhooks</Title>
        <WebhooksList data={webhooks} />
      </View>
    ),
    q: <QView />,
  };

  let opts = [
    { option: 'user', icon: 'user', server: true },
    { option: 'connection', icon: 'settings', server: true },
    { option: 'devices', icon: 'headphones' },
    { option: 'contacts', icon: 'users' },
    { option: 'webhooks', icon: 'share2', server: true },
    { option: 'q', icon: 'q', server: true }
  ]


  if (server)
    opts = opts.filter(opt => opt.server);
  
  return (
    <Screen
      closeable={closeable}
      visible={visible}
      onClose={toggleShowSettings}
    >
      <View  style={{ flex: 1, flexDirection: 'row' }}>
        <View key={option} style={{ backgroundColor: COLORS.backColor, paddingTop: 30 }}>
          {opts.map((opt) => {
            const selected = option === opt.option 
            return (
              <ButtonIcon
                style={{ padding: 20, backgroundColor: selected ? COLORS.app : null }}
                icon={opt.icon}
                color={selected ? COLORS.primary : undefined}
                onClick={() => setOption(opt.option)} 
              />
            )})}
        </View>

        <View style={{ flex: 1, flexDirection: 'row', margin: 10, marginTop: 30 }}>
          {content[option]}
        </View>
      </View>
    </Screen>
  );
};
