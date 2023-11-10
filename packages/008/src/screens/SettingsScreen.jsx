import _ from 'lodash';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

import { Screen } from './Screen';
import { Status } from '../components/Avatars';
import { ButtonIcon, HRule, Select, CancelAccept, Button } from '../components/Basics';
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

const Title = ({ children, style }) => (
  <Text
    style={[{ fontSize: 20, fontWeight: 'bold', paddingBottom: 10 }, style]}
  >
    {children}
  </Text>
);

const RowLink = ({ onClick, text }) => {
  const icons = {
    anchor: <AnchorIcon size={18} />,
    unanchor: <UnanchorIcon size={18} />,
    quit: <XIcon size={18} />,
    logout: <LogOutIcon size={18} />
  };
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
      }}
    >
      {icons[text.toLowerCase()]}
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
    logout
  } = useStore();
  
  if (!electron && !settingsUri) return <View />;

  const isLogout = settingsUri?.length && wsUri?.length && sipUri?.length && sipPassword?.length ;

  return (
    <View>
      {isLogout && <RowLink onClick={logout} text="Logout" />}
      {electron && (
        <RowLink onClick={() => setSettings({ doquit: true })} text="Quit" />
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
        Clear all
      </Button>
    </View>
  )
}

export const AnchorForm = () => {
  const {
    electron,
    anchored,
    setSettings,
  } = useStore();

  return (
    <View>
      {electron && (
        <View>
          <RowLink
            onClick={() => setSettings({ anchored: !anchored })}
            text={!anchored ? 'Anchor' : 'Unanchor'}
          />
        </View>
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

  const { statuses, devices, microphones, status, ringer, microphone, speaker } = values;
  const { color } = statuses?.find(({ value }) => value === status) || {};
  return (
    <View style={style}>
      {statuses?.length > 0 && (
        <FormRow label={'Status'}>
          <Select
            tabIndex="-1"
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
            onChange={e => setValue('status', e.target.value)}
          />
        </FormRow>
      )}

      <HRule />

      <FormRow label={'Speakers'}>
        <Select
          tabIndex="-1"
          options={devices.map(({ deviceId, label }) => {
            return { value: deviceId, text: label };
          })}
          value={speaker}
          onChange={e => setValue('speaker', e.target.value)}
        />
      </FormRow>

      <FormRow label={'Microphone'}>
        <Select
          tabIndex="-1"
          options={microphones.map(({ deviceId, label }) => {
            return { value: deviceId, text: label };
          })}
          value={microphone}
          onChange={e => setValue('microphone', e.target.value)}
        />
      </FormRow>

      <FormRow label={'Ringer'}>
        <Select
          tabIndex="-1"
          options={devices.map(({ deviceId, label }) => {
            return { value: deviceId, text: label };
          })}
          value={ringer}
          onChange={e => setValue('ringer', e.target.value)}
        />
      </FormRow>

      <HRule />

      <AnchorForm />
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
      <Title style={{ fontSize: 16 }}>VCF Import</Title>
      <div
        draggable
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 100,
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'grey',
          padding: 5
        }}
      >
        <Text style={{ fontSize: 14, textAlign: 'center' }}>
          Drop here VCF file to add your contacts.
        </Text>
      </div>
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
    settingsTab = 'settings',
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

  const SettingsButton = ({ icon, option }) => (
    <View style={{ paddingBottom: 15 }}>
      <ButtonIcon icon={icon} onClick={() => setOption(option)} />
    </View>
  );

  const content = {
    settings: (
      <View style={{ flex: 1 }}>
        <Title>Preferences</Title>
        <ScrollView style={{ flex: 1 }}>
          <SettingsForm {...store} onChange={onChangeSettingsHandler} />
        </ScrollView>
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
    user: (
      <View style={{ flex: 1 }}>
        <Title style={{ fontSize: 16 }}>User</Title>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <ExitForm />
          <DangerZone />
        </View>
      </View>
    )
  };

  const closeable = settingsUri?.length || (wsUri?.length && wsUri?.sipUri && wsUri?.sipPassword);
  console.error(settingsUri?.length)

  return (
    <Screen
      closeable={true}
      visible={showSettings}
      onClose={toggleShowSettings}
      style={{ padding: 10 }}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ paddingRight: 10 }}>
          <SettingsButton icon="settings" option="settings" />
          <SettingsButton icon="phone" option="connection" />
          <SettingsButton icon="users" option="contacts" />
          <SettingsButton icon="share2" option="webhooks" />
          <SettingsButton icon="user" option="user" />
        </View>

        {content[option]}
      </View>
    </Screen>
  );
};
