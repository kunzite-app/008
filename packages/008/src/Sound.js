import { Audio as AVAudio } from 'expo-av';
import { Platform } from 'react-native';

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
    this.audio?.playAsync?.();
    this.audio?.play?.();
    this.playing = true;
  }

  async stop() {
    await this.audio?.stopAsync?.();
    await this.audio?.setPositionAsync?.(0);

    this.audio.pause?.();
    this.audio.currentTime = 0;
    this.playing = false;
  }

  async setDevice(deviceId = 'default') {
    this.playing && this.audio.pause();
    await this.audio.setSinkId(deviceId);
    console.log('setting', deviceId )
    this.playing && this.audio.play();
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

export const NOTIFICATION_TONE = new Sound({
  media: `notification`,
  loop: true
});

export const play_failure = (message = {}) => {
  const { statusCode } = message;
  REJECT_TONE.play();
  setTimeout(() => REJECT_TONE.stop(), statusCode === 486 ? 3000 : 1000);
};

export const play_hangup = () => {
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
    console.log('herhere', devices)
    return devices.filter(dev => dev.kind === kind);
  } catch (err) {
    console.log('Error getting audio devices', err);
  }

  return [];
};
