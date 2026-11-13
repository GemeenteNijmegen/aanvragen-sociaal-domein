import { Logger } from '@aws-lambda-powertools/logger';
import { MessageValidator, WebintakeValidator } from '../WebintakeValidator';
import errors from './examples/errors.json';
import valid from './examples/valid.json';

process.env.POWERTOOLS_DEV = 'true';

interface LogLine {
  level: string;
  message: string;
  [key: string]: unknown;
}

function captureLogs(): LogLine[] {
  const lines: LogLine[] = [];
  for (const method of ['debug', 'info', 'warn', 'error'] as const) {
    jest.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      lines.push(JSON.parse(String(args[0])));
    });
  }
  return lines;
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

const newLogger = () => new Logger({ logLevel: 'DEBUG' });
const validator: MessageValidator = new WebintakeValidator();

afterEach(() => jest.restoreAllMocks());

describe('WebintakeValidator', () => {
  it('accepts a valid message and logs one info line', () => {
    const logs = captureLogs();
    expect(validator.validate(valid, { logger: newLogger() })).toEqual({ status: 'valid', problems: [] });
    expect(logs.map((line) => [line.level, line.message])).toEqual([['INFO', 'Webintake valid']]);
    expect(logs[0]).toMatchObject({ component: 'webintake-validation', zaakIdentificatie: 'OF-TEST-0001' });
  });

  it('reports all problems in one message', () => {
    captureLogs();
    expect(validator.validate(errors, { logger: newLogger() })).toEqual({
      status: 'invalid',
      problems: [
        { path: 'Aanvraagdatum', segments: ['Aanvraagdatum'], code: 'missing', detail: 'Field is required' },
        {
          path: 'Toelichting',
          segments: ['Toelichting'],
          code: 'too_big',
          detail: 'Too big: expected string to have <=1200 characters',
          limit: { max: 1200 },
        },
        { path: 'Webintake', segments: [], code: 'unrecognized_keys', detail: 'Unrecognized key: "Email"' },
        {
          path: 'Client',
          segments: ['Client'],
          code: 'order',
          detail: 'Must come after Toelichting. Expected order: Berichtsoort, ZaakIdentificatie, Toelichting, Client',
        },
      ],
    });
  });

  it('keeps personal data out of non-debug lines and tags every line', () => {
    const logs = captureLogs();
    validator.validate(errors, { logger: newLogger(), context: { mode: 'dry-run' } });
    const toelichting = (line: LogLine) => JSON.stringify(line).includes('verzonnen toelichting');
    expect(logs.filter((line) => line.level !== 'DEBUG').some(toelichting)).toBe(false);
    expect(logs.filter((line) => line.level === 'DEBUG').some(toelichting)).toBe(true);
    for (const line of logs) {
      expect(line).toMatchObject({ zaakIdentificatie: 'OF-TEST-0002', context: { mode: 'dry-run' } });
    }
  });

  it('never throws and never changes the message', () => {
    const logs = captureLogs();
    expect(validator.validate(undefined, { logger: newLogger() }).problems).toEqual([
      { path: 'Webintake', segments: [], code: 'missing', detail: 'Field is required' },
    ]);
    expect(validator.validate(null, { logger: newLogger() }).problems).toEqual([
      { path: 'Webintake', segments: [], code: 'invalid_type', detail: 'Invalid input: expected object, received null' },
    ]);

    const broken = { ...valid };
    Object.defineProperty(broken, 'Aanvraagdatum', { enumerable: true, get: () => { throw new Error('Forced failure'); } });
    expect(validator.validate(broken, { logger: newLogger() })).toEqual({ status: 'error', problems: [] });
    expect(logs.filter((line) => line.level === 'ERROR').map((line) => line.message)).toEqual(['Webintake validation failed']);

    const frozen = deepFreeze(structuredClone(errors));
    validator.validate(frozen, { logger: newLogger() });
    expect(frozen).toEqual(errors);
  });

  it('keeps log keys per validation and away from the caller logger', () => {
    const logs = captureLogs();
    const logger = newLogger();
    logger.appendKeys({ formReference: 'TEST-REF' });
    validator.validate(errors, { logger, logKeys: { zaakIdentificatie: 'OF-TEST-A' } });
    const first = logs.length;
    validator.validate(errors, { logger, logKeys: { zaakIdentificatie: 'OF-TEST-B' } });
    logger.info('Caller line');

    const caller = logs.pop();
    expect(logs.slice(0, first).every((line) => line.zaakIdentificatie === 'OF-TEST-A')).toBe(true);
    expect(logs.slice(first).every((line) => line.zaakIdentificatie === 'OF-TEST-B')).toBe(true);
    expect(logs.every((line) => line.formReference === 'TEST-REF')).toBe(true);
    expect(caller).not.toHaveProperty('zaakIdentificatie');
    expect(caller).not.toHaveProperty('component');
  });
});
