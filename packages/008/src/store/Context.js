import { createContext } from 'react';
import { Platform } from 'react-native';
import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  subscribeWithSelector
} from 'zustand/middleware';
import { encode } from 'base-64';
import _ from 'lodash';

import { getMicrophones, getSpeakers } from '../Sound';
import Contacts from './Contacts';
import { genId } from '../utils';

const contacts = new Contacts();

const COOKIE_ID = 'KZS';
const CONTACTS_ID = 'KZSC';

const initializeStore = async () => {
  const requestPermissions = async () => {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    await Notification.requestPermission();
  };

  const initAudioDevices = async () => {
    const setAudioDevices = async () => {
      const devices = await getSpeakers();
      const microphones = await getMicrophones();

      useStore.setState({ devices, microphones });
    };

    if (Platform.OS === 'web') {
      navigator.mediaDevices.ondevicechange = setAudioDevices;
    }
    setAudioDevices();
  };

  const initContacts = () => {
    if (Platform.OS === 'web') {
      document.addEventListener('indexing:end', async () => {
        const contactsDialer = contacts.query({ query: '' });
        useStore.setState({ contactsDialer });

        contacts.save(CONTACTS_ID);
      });
    }

    setTimeout(() => {
      contacts.load(CONTACTS_ID);
    }, 1000);
  };

  await requestPermissions();
  initAudioDevices();
  initContacts();
};

const DEFAULTS = {
  status: 'online',
  statuses: [
    { value: 'online', text: 'Online', color: '#057e74' },
    { value: 'offline', text: 'Offline', color: '#A9A9A9' }
  ],

  devices: [],
  microphones: [],
  ringer: 'default',
  speaker: 'default',
  microphone: 'default',

  number_out: undefined,
  numbers: [],

  sipUri: undefined,
  sipUser: undefined,
  sipPassword: undefined,
  wsUri: undefined,

  transferAllowed: true,
  blindTransferAllowed: true,
  allowVideo: true,
  allowAutoanswer: false,
  autoanswer: 5,

  avatar: undefined,
  nickname: undefined,

  size: { width: 360, height: 500 }
};

export const useStore = create(
  persist(
    subscribeWithSelector((set, get) => {
      return {
        ...DEFAULTS,

        cdrs: [],
        webhooks: [],

        clear: () => {
          localStorage.clear();
          contacts.clear();

          set(() => ({
            ...DEFAULTS,
            contactsDialer: {},
            contactsDialerFilter: '',
            cdrs: [],
            webhooks: [],
            settingsUri: undefined
          }));

          initializeStore();
        },
        setSettings: settings => {
          const { settingsUri, logout } = get();

          set(() => ({ ...settings }));

          if (
            settingsUri &&
            settingsUri !== settings.settingsUri &&
            settings.settingsUri !== undefined
          ) {
            logout();
          }
        },
        showLogin: false,
        toggleShowLogin: value =>
          set(state => ({
            showLogin: _.isNil(value) ? !state.showLogin : value
          })),
        login: async ({ user, password }) => {
          const { settingsUri } = get();

          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Basic ${encode(`${user}:${password}`)}`
          };

          const response = await fetch(settingsUri, {
            method: 'GET',
            headers
          });

          if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

          const settings = await response.json();
          set(() => ({ ...DEFAULTS, ...settings }));
        },
        logout: () => {
          set(() => ({
            sipUri: undefined,
            sipPassword: undefined,
            wsUri: undefined
          }));
        },

        showSettings: false,
        settingsTab: null,
        toggleShowSettings: (value, tab) => {
          set(state => ({
            showSettings: _.isNil(value) ? !state.showSettings : value,
            settingsTab: tab
          }));
        },

        contacts: () => contacts,
        contactsDialer: {},
        contactsDialerFilter: '',
        setContactsDialerFilter: contactsDialerFilter => {
          const contactsDialer = contacts.query({
            query: contactsDialerFilter
          });
          set(() => ({ contactsDialer, contactsDialerFilter }));
        },

        cdrAdd: cdr => {
          const { cdrs } = get();
          const { headers, ...rest } = cdr;
          cdrs.unshift(rest);
          set(() => ({ cdrs: cdrs.slice(0, 100) }));
        },

        webhookAdd: ({ label, endpoint }) => {
          const { webhooks } = get();
          webhooks.push({ id: genId(), label, endpoint });
          set(() => ({ webhooks }));
        },
        webhookDelete: webhook =>
          set(() => ({
            webhooks: get().webhooks.filter(({ id }) => id !== webhook.id)
          })),
        toggleShowWebhookForm: value => {
          set(state => ({
            showWebhookForm: _.isNil(value) ? !state.showWebhookForm : value
          }));
        },
        showWebhookForm: false,

        electron: false,
        anchored: true,
        doquit: false
      };
    }),
    {
      name: COOKIE_ID,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: state => initializeStore(),
      partialize: ({
        doquit,
        devices,
        showSettings,
        settingsTab,
        showLogin,
        showWebhookForm,
        ...rest
      }) => ({ ...rest })
    }
  )
);

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const store = useStore();

  return <Context.Provider value={store}>{children}</Context.Provider>;
};
