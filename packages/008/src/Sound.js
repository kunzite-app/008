import { Platform } from 'react-native';
import { Audio as AVAudio } from 'expo-av';

const setSinkId = async ({ audio, deviceId }) => {
  await audio?.stopAsync?.();
  audio.pause?.();

  const speakers = await getSpeakers();
  const speaker =
    speakers.find(dev => dev.deviceId === deviceId)?.deviceId || 'default';
  await audio.setSinkId(speaker);
};

export default class Sound {
  constructor({ media, loop = false } = {}) {
    const init = async () => {
      if (Platform.OS === 'web') {
        this.audio = new Audio(`./assets/sounds/${media}.mp3`);
        this.audio.loop = loop;
      } else {
        const { sound } = await AVAudio.Sound.createAsync(
          require(`../web/assets/sounds/${media}.mp3`),
          { isLooping: loop }
        );
        this.audio = sound;
      }
    };

    init();
  }

  async play() {
    await setSinkId({ audio: this.audio, deviceId: this.deviceId });
    this.audio?.playAsync?.();
    this.audio?.play?.();
    this.playing = true;
  }

  async stop(pause) {
    await this.audio?.stopAsync?.();
    this.audio.pause?.();

    if (!pause) {
      await this.audio?.setPositionAsync?.(0);
      this.audio.currentTime = 0;
    }

    this.playing = false;
  }

  async setDevice(deviceId) {
    this.deviceId = deviceId;

    if (this.playing) {
      this.stop(true);
      this.audio.play();
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
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(dev => dev.kind === kind);
  } catch (err) {
    console.log('Error getting audio devices', err);
  }

  return [];
};
