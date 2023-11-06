export class Cdr {
  constructor({ session }) {
    const id =
      session.request.getHeader('X-Call-ID') ||
      session.request.getHeader('Call-ID');
    const {
      displayName,
      uri: { user, headers }
    } = session.remoteIdentity;

    const direction = session.isInbound() ? 'inbound' : 'outbound';

    this.id = id;
    this.direction = direction;
    this.from = session.isInbound()
      ? user
      : session.request.getHeader('P-Asserted-Identity');
    this.to = session.isInbound() ? displayName : user;
    this.headers = headers;

    this.video = session.isVideo();

    this.status = 'ringing';
    this.date = new Date();
  }

  accepted() {
    this.status = 'answered';

    this.wait = this.secondsElapsed();
  }

  terminated() {
    this.status = this.status === 'answered' ? this.status : 'missed';

    this.wait = this.wait || this.secondsElapsed();
    this.total = this.secondsElapsed();
    this.duration = this.total - this.wait;
  }

  secondsElapsed() {
    return Math.ceil((new Date() - this.date) / 1000);
  }

  setContact(contact) {
    this.contact = contact;
  }
}
