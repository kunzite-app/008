import { useStore } from './Context';

const emit = (ev, data) =>
  document?.dispatchEvent(new CustomEvent(ev, { detail: data }));

let ipcRenderer;
export const quit = () => ipcRenderer?.send('quit');
export const show = () => ipcRenderer?.send('show');
export const anchor = () => ipcRenderer?.send('anchor');
export const unanchor = () => ipcRenderer?.send('unanchor');
export const resize = size => ipcRenderer?.send('resize', { ...size });

export const init = () => {
  try {
    ipcRenderer = window.require('electron').ipcRenderer;

    useStore.setState({ electron: true });
    useStore.subscribe(state => state.size, resize);
    useStore.subscribe(
      state => state.doquit,
      doquit => doquit && quit()
    );
    useStore.subscribe(
      state => state.anchored,
      anchored => (anchored ? anchor() : unanchor())
    );

    ipcRenderer?.on('anchored', (_, { anchored }) =>
      useStore.setState({ anchored })
    );

    ipcRenderer?.on('deep-link', (_, { url: number }) =>
      emit('click2call', { number })
    );

    document?.addEventListener('notification:click', show);

    resize(useStore.getState().size);
  } catch (err) {
    console.log('Electron not found?', err);
  }
};

export const openLink = ({ url }) => {
  ipcRenderer?.send('open', { url });
  window?.open(url, '_blank');
};
