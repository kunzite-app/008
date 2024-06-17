import {
  UserAgent,
  Registerer,
  Inviter,
  Invitation,
  RegistererState,
  Session,
  SessionState,
  Web,
  LoggerFactory
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
  this.sessionDescriptionHandler.localMediaStream?.getAudioTracks().forEach(track => {
    track.enabled = !muted;
  });

  this._muted = muted;
};

Session.prototype.setMutedVideo = function (muted) {
  this.sessionDescriptionHandler.localMediaStream?.getVideoTracks().forEach(track => {
    track.enabled = !muted;
  });
};

Session.prototype.setHold = async function (hold) {
  if (this.state !== SessionState.Established) return;
  await this.invite({
    sessionDescriptionHandlerModifiers: hold ? [Web.holdModifier] : []
  });

  this._hold = hold;
};

Session.prototype.isHold = function () {
  return this._hold;
}

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
  SessionState,
  LoggerFactory,
};
