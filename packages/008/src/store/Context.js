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
import { init as initElectron } from './Electron';
import { init as initEvents } from './Events';
import Contacts from './Contacts';

const contacts = new Contacts();

const COOKIE_ID = 'KZS';
const CONTACTS_ID = 'KZSC';

const initializeStore = async state => {
  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
    } catch (err) {
      console.error('Failed obtaining audio permissions', err);
    }

    try {
      await Notification.requestPermission();
    } catch (err) {
      console.error('Failed obtaining Notification permissions', err);
    }
  };

  const initAudioDevices = async () => {
    const setAudioDevices = async () => {
      try {
        const devices = await getSpeakers();
        const microphones = await getMicrophones();

        state.setSettings({ devices, microphones });
      } catch (err) {
        console.error(err);
      }
    };

    if (Platform.OS === 'web')
      navigator.mediaDevices.ondevicechange = setAudioDevices;
    setAudioDevices();
  };

  const initContacts = () => {
    if (Platform.OS === 'web') {
      document.addEventListener('indexing:end', async () => {
        const contactsDialer = contacts.query({ query: '' });
        state.setSettings({ contactsDialer });

        contacts.save(CONTACTS_ID);
      });
    }

    contacts.load(CONTACTS_ID);
  };

  await requestPermissions();
  initAudioDevices();

  initElectron();
  initEvents();

  initContacts();
};

const DEFAULTS = {
  statuses: [
    { value: 'online', text: 'Online', color: '#057e74' },
    { value: 'offline', text: 'Offline', color: '#A9A9A9' }
  ],

  numbers: [],

  sipUri: undefined,
  sipUser: undefined,
  sipPassword: undefined,
  wsUri: undefined,

  allowTransfer: true,
  allowBlindTransfer: true,
  allowVideo: true,
  allowAutoanswer: false,
  autoanswer: 5,

  settingsUri: undefined,
  nickname: undefined,
  password: undefined,
  avatar: undefined,

  webhooks: [],

  qTts: true,
  qSummarization: false,
  events: [],

  size: { width: 340, height: 460 },

  server: false
};

const DEFAULTS_NOCONFIG = {
  status: 'online',
  number_out: undefined,

  devices: [],
  microphones: [],
  ringer: 'default',
  speaker: 'default',
  microphone: 'default',
  contactsDialer: {},
  contactsDialerFilter: '',
  cdrs: []
};

export const useStore = create(
  persist(
    subscribeWithSelector((set, get) => {
      return {
        ...DEFAULTS,
        ...DEFAULTS_NOCONFIG,

        electron: false,
        anchored: true,
        doquit: false,

        setSettings: settings => {
          set(() => ({ ...settings }));
        },

        login: async ({ settingsUri, nickname, password }) => {
          if (!settingsUri) throw new Error(`No settings uri available!`);

          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Basic ${encode(`${nickname}:${password}`)}`
          };

          let response;

          if (!/^(https?|file):\/\//i.test(settingsUri)) {
            try {
              response = await fetch(`file://${settingsUri}`, {
                method: 'GET',
                headers
              });
            } catch (err) {
              console.error(err);
            }
          }

          if (!response?.ok) {
            response = await fetch(settingsUri, {
              method: 'GET',
              headers
            });

            if (!response.ok)
              throw new Error(`HTTP status: ${response.status}`);
          }

          const settings = await response.json();
          const { number_out, numbers = [] } = settings;
          if (!number_out) {
            settings.number_out = numbers[0]?.name || '';
          }

          set(() => ({
            ...DEFAULTS,
            ...settings,
            settingsUri,
            showSettings: false
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

        eventAdd: event => {
          const { events } = get();
          events.unshift(event);
          set(() => ({ events: events.slice(0, 100) }));
        },

        clear: () => {
          localStorage.clear();
          contacts.clear();

          set(() => ({ ...DEFAULTS, ...DEFAULTS_NOCONFIG }));

          initializeStore(get());
        }
      };
    }),
    {
      name: COOKIE_ID,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: state => initializeStore(state),
      partialize: ({
        doquit,
        devices,
        showSettings,
        settingsTab,
        showWebhookForm,
        ...rest
      }) => ({ ...rest })
    }
  )
);

export const Context = createContext();

export const ContextProvider = ({ children }) => (
  <Context.Provider value={useStore()}>{children}</Context.Provider>
);
