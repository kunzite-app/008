import { Platform } from 'react-native';

import PQueue from 'p-queue';
import _ from 'lodash';

import { useStore } from './store/Context';
import { request } from './utils';

const QUEUE = new PQueue();

let qLLMEnabled = false;
const qworkerLLM = new Worker(new URL('008QWorkerLLM.js', import.meta.url), {
  type: 'module'
});
qworkerLLM.addEventListener('message', ({ data }) =>
  emit({ type: 'phone:summarization', data })
);

let qTTSEnabled = false;
const qworkerTTS = new Worker(new URL('008QWorkerTTS.js', import.meta.url), {
  type: 'module'
});
qworkerTTS.addEventListener('message', ({ data }) => {
  emit({ type: 'phone:transcript', data });

  if (qLLMEnabled) qworkerLLM.postMessage(data);
});

export const emit = async ({ type, data: payload }) => {
  if (type === 'phone:audio' && qTTSEnabled) {
    qworkerTTS.postMessage(payload);
    return;
  }

  const store = useStore.getState();
  const context = _.pick(store, [
    'nickname',
    'sipUri',
    'sipUser',
    'language',
    'device',
    'size',
    'status'
  ]);

  const data = { ...payload, context };

  for (const idx in store.webhooks) {
    const { endpoint } = store.webhooks[idx];
    QUEUE.add(() => request({ endpoint, body: data, retries: 5, qdelay: 30 }));
  }

  document?.dispatchEvent?.(new CustomEvent(type, { detail: data }));
  window?.parent?.postMessage?.({ type, data }, '*');
};

export const init = () => {
  const store = useStore.getState();
  qTTSEnabled = store.qTts;
  qLLMEnabled = store.qSummarization;

  useStore.subscribe(
    state => state.status,
    status => emit({ type: 'status:change', data: { status } })
  );

  useStore.subscribe(
    state => state.qTts,
    value => (qTTSEnabled = value)
  );

  useStore.subscribe(
    state => state.qSummarization,
    value => {
      qLLMEnabled = value;
    }
  );

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
    events.forEach(event => document?.addEventListener(event, eventHandler));
  }
};
