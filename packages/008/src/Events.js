import { Platform } from 'react-native';

import PQueue from 'p-queue';
import _ from 'lodash';

import { useStore } from './store/Context';
import { request } from './utils';

export class Webhooks {
  constructor({ concurrency = 1 } = {}) {
    this.webhooks = [];
    this.queue = new PQueue({ concurrency });
  }

  add({ endpoint }) {
    this.endpoints.push({ endpoint });
  }

  async addJob({ event, retries = 5, qdelay = 30 }) {
    for (const webhook of this.webhooks) {
      const { endpoint } = webhook;
      await this.queue.add(() =>
        request({ endpoint, body: event, retries, qdelay })
      );
    }
  }
}

const WEBHOOKS = new Webhooks();

export const emit = async ({ type, data: payload }) => {
  const store = useStore.getState();
  const context = _.pick(store, [
    'nickname',
    'sipUri',
    'sipUser',
    'language',
    'device',
    'size'
  ]);

  const data = { ...payload, context };

  console.error(type, data);
  document?.dispatchEvent?.(new CustomEvent(type, { detail: data }));
  window?.parent?.postMessage?.({ type, data }, '*');
  WEBHOOKS.addJob({ event: { type, data } });
};

export const init = () => {
  const store = useStore.getState();

  useStore.subscribe(
    state => state.status,
    status => emit({ type: 'status:change', data: { status } })
  );

  useStore.subscribe(
    state => state.webhooks,
    webhooks => {
      WEBHOOKS.webhooks = webhooks;
    }
  );
  WEBHOOKS.webhooks = store.webhooks;

  if (Platform.OS === 'web') {
    const events = ['contacts', 'settings', 'click2call', 'call', 'hangup'];

    const eventHandler = ev => {
      const { type, detail, data } = ev.data || ev;

      if (!events.includes(type)) return;

      const payload = detail || data;

      if (type === 'contacts') store.contacts().index({ contacts: payload });

      if (type === 'settings') store.setSettings(payload);
    };

    window?.addEventListener('message', eventHandler);
    events.forEach(event => {
      document?.addEventListener(event, eventHandler);
    });
  }
};
