import _ from 'lodash';
import { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';

import { Screen } from './Screen';
import { Status , ButtonIcon, HRule, Select, CancelAccept, Button, Text, COLORS } from '../components/Basics';
import { FormRow, InputRow } from '../components/Forms';
import {
  AnchorIcon,
  LogOutIcon,
  UnanchorIcon,
  XIcon
} from '../components/Icons';
import { WebhooksList } from '../components/Lists';

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
    logout: <LogOutIcon size={iconSize} />
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
    settingsUri,
    wsUri,
    sipUri,
    sipPassword,
    setSettings,
    logout,
    anchored
  } = useStore();
  
  if (!electron && !settingsUri) return <View />;

  const isLogout = settingsUri?.length && wsUri?.length && sipUri?.length && sipPassword?.length ;

  return (
    <View>
      {electron && (
        <View>
          <RowLink
            onClick={() => setSettings({ anchored: !anchored })}
            text={!anchored ? 'Anchor' : 'Unanchor'}
          />
           <HRule />
        </View>
      )}
      
      {isLogout && <RowLink onClick={logout} text="Logout" />}
      {electron && (
        <View>
           <RowLink onClick={() => setSettings({ doquit: true })} text="Quit" />
        </View>
      )}
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

export const SettingsForm = (props) => {
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
    wsUri = '',
    sipUri = '',
    sipUser = '',
    sipPassword = ''
  } = values;

  return (
    <View>
      <InputRow
        label={'Settings Uri'}
        placeholder="https://example.com/settings"
        value={settingsUri}
        onChange={val => setValue('settingsUri', val)}
      />

      <HRule />

      <InputRow
        disabled={settingsUri.length}
        label={'WS Uri'}
        placeholder="wss://example.com/ws"
        value={wsUri}
        onChange={val => setValue('wsUri', val)}
      />

      <InputRow
        disabled={settingsUri.length}
        label={'Sip Uri'}
        placeholder="https://example.com/sip"
        value={sipUri}
        onChange={val => setValue('sipUri', val)}
      />

      <InputRow
        disabled={settingsUri.length}
        label={'Sip user'}
        placeholder="JohnDoe"
        value={sipUser}
        onChange={val => setValue('sipUser', val)}
      />

      <InputRow
        disabled={settingsUri.length}
        label={'Sip password'}
        password
        value={sipPassword}
        onChange={val => setValue('sipPassword', val)}
      />
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

export const WebhookForm = ({ onChange, onSubmit }) => {
  const [values, setValues] = useState({});

  const setValue = (field, value) => {
    const val = { ...values };
    val[field] = value;

    setValues(val);
    onChange?.(val);
  };

  const { label = '', endpoint = '' } = values;

  return (
    <View>
      <InputRow
        label={'Label'}
        placeholder="Example"
        value={label}
        onChange={val => setValue('label', val)}
      />

      <InputRow
        label={'Endpoint'}
        placeholder="https://example.com/webhook"
        value={endpoint}
        onChange={val => setValue('endpoint', val)}
      />

      <CancelAccept onAccept={() => onSubmit?.(values)} />
    </View>
  );
};

export const SettingsScreen = () => {
  const store = useStore();
  const {
    settingsUri,
    wsUri,
    sipUri,
    sipPassword,

    showSettings,
    toggleShowSettings,
    settingsTab = 'user',
    setSettings,

    webhooks,
    webhookDelete,
    webhookAdd,
    toggleShowWebhookForm,
    showWebhookForm
  } = store;

  const [option, setOption] = useState(settingsTab);

  const [connection, setConnection] = useState({
    settingsUri,
    wsUri,
    sipUri,
    sipPassword,
  });

  useEffect(() => {
    setOption(settingsTab);
  }, [settingsTab]);

  useEffect(() => {
    setConnection({ settingsUri, wsUri, sipUri, sipPassword });
  }, [settingsUri, wsUri, sipUri, sipPassword]);

  const onChangeSettingsHandler = input => {
    setSettings(input);
  };

  const onChangeConnectionHandler = input => {
    setConnection(input);
  };

  const content = {
    user: (
      <View style={{ flex: 1 }}>
        <SettingsForm {...store} onChange={onChangeSettingsHandler} />
        <HRule/>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <ExitForm />
            <HRule/>
          </View>
          <DangerZone />
        </View>
      </View>
    ),
    connection: (
      <View style={{ flex: 1 }}>
        <Title>Connection</Title>
        <ScrollView style={{ flex: 1 }}>
          <ConnectionForm
            {...store}
            {...connection}
            onChange={onChangeConnectionHandler}
          />

          <CancelAccept
            onCancel={() => {
              setConnection({
                settingsUri,
                wsUri,
                sipUri,
                sipPassword
              });
            }}
            onAccept={() => setSettings(connection)}
          />
        </ScrollView>
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
        
        <ButtonIcon
          style={{ width: 20 }}
          icon="plus"
          onClick={() => toggleShowWebhookForm(true)}
        />
        
        <WebhooksList data={webhooks} onDeleteClick={webhookDelete} />
        
        <Screen
          visible={showWebhookForm}
          closeable
          onClose={toggleShowWebhookForm}
        >
          <WebhookForm
            onSubmit={webhook => {
              webhookAdd(webhook);
              toggleShowWebhookForm(false);
            }}
          />
        </Screen>
      </View>
    ),
  };
  
  const opts = [
    { option: 'user', icon: 'user' },
    { option: 'connection', icon: 'settings' },
    { option: 'devices', icon: 'headphones' },
    { option: 'contacts', icon: 'users' },
    { option: 'webhooks', icon: 'share2' }
  ]

  return (
    <Screen
      closeable={true}
      visible={showSettings}
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
                color={selected ? COLORS.primary : null}
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
