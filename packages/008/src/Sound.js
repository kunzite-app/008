import { Platform } from 'react-native';
// import { Audio as AVAudio } from 'expo-av';
import RNSound from 'react-native-sound';


const setSinkId = async ({ audio, deviceId }) => {
  const speakers = await getSpeakers();
  const speaker =
    speakers.find(dev => dev.deviceId === deviceId)?.deviceId || 'default';

  await audio.setSinkId?.(speaker);
};

export default class Sound {
  constructor({ media, loop = false } = {}) {
    const init = async () => {
      if (Platform.OS === 'web') {
        this.audio = new Audio(`./assets/sounds/${media}.mp3`);
        this.audio.loop = loop;
      } else {
        this.audio = new RNSound(`${media}.mp3`, RNSound.MAIN_BUNDLE);
        this.audio.setNumberOfLoops(loop ? -1 : 0);
      }
    };

    init();
  }

  async play() {
    if (!this.audio) return;

    this.stop();
    await setSinkId({ audio: this.audio, deviceId: this.deviceId });
    this.audio.play?.();
    this.playing = true;
  }

  async stop(pause) {
    if (!this.audio) return;

    await this.audio.stopAsync?.();
    this.audio.pause?.();

    if (!pause) {
      await this.audio.setPositionAsync?.(0);
      this.audio.currentTime = 0;
    }

    this.playing = false;
  }

  async setDevice(deviceId) {
    this.deviceId = deviceId;

    if (this.playing) {
      this.stop(true);
      this.play();
    }
  }
}

export const RING_TONE = new Sound({
  media: `ring`,
  loop: true
});

export const RING_BACK = new Sound({
  media: `ringback`,
  loop: true
});

export const REJECT_TONE = new Sound({
  media: `busy`,
  loop: true
});

export const play_tone = () => {
  REJECT_TONE.play();
  setTimeout(() => REJECT_TONE.stop(), 1000);
};

export const play_reject = () => {
  REJECT_TONE.play();
  setTimeout(() => REJECT_TONE.stop(), 3000);
};

export const getSpeakers = async () => {
  return getDevices({ kind: 'audiooutput' });
};

export const getMicrophones = async () => {
  return getDevices({ kind: 'audioinput' });
};

export const getDevices = async ({ kind }) => {
  if (Platform.OS !== 'web') return [];

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(dev => dev.kind === kind);
  } catch (err) {
    console.log('Error getting audio devices', err);
  }

  return [];
};
