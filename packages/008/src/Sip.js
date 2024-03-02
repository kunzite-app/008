import {
  UserAgent,
  Registerer,
  Inviter,
  Invitation,
  RegistererState,
  Session,
  SessionState,
  Web
} from 'sip.js';

Session.prototype.getStream = function () {
  try {
    const stream = new MediaStream();
    this.sessionDescriptionHandler?.peerConnection
      ?.getReceivers()
      .forEach(({ track }) => {
        if (track) stream.addTrack(track);
      });

    return stream;
  } catch (err) {
    console.error(err);
  }
};

Session.prototype.setMuted = function (muted) {
  this._muted = muted;
  this.sessionDescriptionHandler?.peerConnection
    ?.getLocalStreams()
    .forEach(stream => {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    });
};

Session.prototype.setMutedVideo = function (muted) {
  this._mutedVideo = muted;
  this.sessionDescriptionHandler?.peerConnection
    ?.getLocalStreams()
    .forEach(stream => {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !muted;
      });
    });
};

Session.prototype.hold = async function () {
  this.setHold(true);
};

Session.prototype.unhold = async function () {
  this.setHold(false);
};

Session.prototype.setHold = async function (hold) {
  this._hold = hold;

  if (this.state !== SessionState.Established) return;
  await this.invite({
    sessionDescriptionHandlerModifiers: hold ? [Web.holdModifier] : []
  });
};

Session.prototype.isVideo = function () {
  if (this.isInbound())
    return (
      this.request?.body?.includes?.('m=video') ||
      this.request?.body?.body?.includes?.('m=video')
    );

  return this.sessionDescriptionHandlerOptions.constraints?.video;
};

Session.prototype.isInbound = function () {
  return this instanceof Invitation;
};

Session.prototype.autoanswer = function () {
  return this.request?.getHeader('X-Autoanswer');
};

Session.prototype.dtmf = function (key) {
  this.info({
    requestOptions: {
      body: {
        contentDisposition: 'render',
        contentType: 'application/dtmf-relay',
        content: `Signal=${key}\r\nDuration=1000`
      }
    }
  });
};

export {
  UserAgent,
  Registerer,
  Inviter,
  Invitation,
  RegistererState,
  Session,
  SessionState
};
