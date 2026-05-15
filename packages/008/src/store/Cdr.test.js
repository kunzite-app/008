import { Cdr } from './Cdr';

const buildSession = ({
  callId = 'call-123',
  xCallId,
  direction = 'inbound',
  displayName = 'Jane Doe',
  user = '+34917370224',
  pAssertedIdentity = '+34917370225',
  headers = { 'X-Foo': 'bar' },
  video = false
} = {}) => {
  const requestHeaders = {
    'Call-ID': callId,
    ...(xCallId ? { 'X-Call-ID': xCallId } : {}),
    'P-Asserted-Identity': pAssertedIdentity
  };

  return {
    request: { getHeader: name => requestHeaders[name] },
    remoteIdentity: { displayName, uri: { user, headers } },
    isInbound: () => direction === 'inbound',
    isVideo: () => video
  };
};

describe('Cdr', () => {
  it('prefers X-Call-ID over Call-ID when present', () => {
    const cdr = new Cdr({
      session: buildSession({ callId: 'call-1', xCallId: 'x-call-1' })
    });
    expect(cdr.id).toBe('x-call-1');
  });

  it('falls back to Call-ID', () => {
    const cdr = new Cdr({ session: buildSession({ callId: 'call-2' }) });
    expect(cdr.id).toBe('call-2');
  });

  it('builds an inbound CDR with from=user and to=displayName', () => {
    const cdr = new Cdr({
      session: buildSession({
        direction: 'inbound',
        user: '+1',
        displayName: 'Caller'
      })
    });

    expect(cdr.direction).toBe('inbound');
    expect(cdr.from).toBe('+1');
    expect(cdr.to).toBe('Caller');
    expect(cdr.status).toBe('ringing');
  });

  it('builds an outbound CDR with from=P-Asserted-Identity and to=user', () => {
    const cdr = new Cdr({
      session: buildSession({
        direction: 'outbound',
        user: '+2',
        pAssertedIdentity: '+99'
      })
    });

    expect(cdr.direction).toBe('outbound');
    expect(cdr.from).toBe('+99');
    expect(cdr.to).toBe('+2');
  });

  it('marks status answered and stores wait on accepted()', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const cdr = new Cdr({ session: buildSession() });
    jest.setSystemTime(new Date('2026-01-01T00:00:03Z'));

    cdr.accepted();

    expect(cdr.status).toBe('answered');
    expect(cdr.wait).toBe(3);
    jest.useRealTimers();
  });

  it('on terminated without accepted() marks the call as missed', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const cdr = new Cdr({ session: buildSession() });
    jest.setSystemTime(new Date('2026-01-01T00:00:05Z'));

    cdr.terminated();

    expect(cdr.status).toBe('missed');
    expect(cdr.wait).toBe(5);
    expect(cdr.total).toBe(5);
    expect(cdr.duration).toBe(0);
    jest.useRealTimers();
  });

  it('on terminated after accepted() preserves answered status and computes duration', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const cdr = new Cdr({ session: buildSession() });

    jest.setSystemTime(new Date('2026-01-01T00:00:02Z'));
    cdr.accepted();

    jest.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    cdr.terminated();

    expect(cdr.status).toBe('answered');
    expect(cdr.wait).toBe(2);
    expect(cdr.total).toBe(10);
    expect(cdr.duration).toBe(8);
    jest.useRealTimers();
  });
});
