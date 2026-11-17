import { Logger } from '@aws-lambda-powertools/logger';
import { MessageValidator, WebintakeValidator } from '../WebintakeValidator';
import adresTelefoon from './examples/adres-telefoon.json';
import berichtsoort from './examples/berichtsoort.json';
import client from './examples/client.json';
import errors from './examples/errors.json';
import production from './examples/production.json';
import relatie from './examples/relatie.json';
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

  it('reports a Berichtsoort with two soorten and a wrong code in one of them', () => {
    captureLogs();
    expect(validator.validate(berichtsoort, { logger: newLogger() }).problems).toEqual([
      {
        path: 'Berichtsoort.VRIJ.Onderwerp',
        segments: ['Berichtsoort', 'VRIJ', 'Onderwerp'],
        code: 'invalid_format',
        detail: 'Expected a code from 50 to 99',
      },
      {
        path: 'Berichtsoort',
        segments: ['Berichtsoort'],
        code: 'choice',
        detail: 'Expected exactly one of WWB, IOAW, WMO, REI, SHV, INB, VRIJ, found WWB, VRIJ',
      },
    ]);
  });

  it('reports wrong, missing and misplaced fields of the Client', () => {
    captureLogs();
    expect(validator.validate(client, { logger: newLogger() }).problems).toEqual([
      { path: 'Client.BurgerServiceNr', segments: ['Client', 'BurgerServiceNr'], code: 'invalid_format', detail: 'Expected 9 digits' },
      { path: 'Client.Achternaam', segments: ['Client', 'Achternaam'], code: 'invalid_format', detail: 'Expected no digits' },
      { path: 'Client.Geboortedatum', segments: ['Client', 'Geboortedatum'], code: 'missing', detail: 'Field is required' },
      {
        path: 'Client.Geslacht',
        segments: ['Client', 'Geslacht'],
        code: 'order',
        detail: 'Must come after BurgerServiceNr. Expected order: BurgerServiceNr, Achternaam, Geslacht, CdFictieveGeboortedat',
      },
    ]);
  });

  it('reports wrong address fields and a wrong second phone number', () => {
    captureLogs();
    expect(validator.validate(adresTelefoon, { logger: newLogger() }).problems).toEqual([
      {
        path: 'Client.Correspondentieadres.Straatnaam',
        segments: ['Client', 'Correspondentieadres', 'Straatnaam'],
        code: 'too_big',
        detail: 'Too big: expected string to have <=24 characters',
        limit: { max: 24 },
      },
      {
        path: 'Client.Correspondentieadres.Postcode',
        segments: ['Client', 'Correspondentieadres', 'Postcode'],
        code: 'invalid_format',
        detail: 'Expected a postcode as 1234AB',
      },
      {
        path: 'Client.Telefoonnr[1].Abonneenr',
        segments: ['Client', 'Telefoonnr', 1, 'Abonneenr'],
        code: 'invalid_format',
        detail: 'Expected up to 10 digits',
      },
    ]);
  });

  it('reports problems in the Partner and in the second BijstandspersoonOverig', () => {
    captureLogs();
    expect(validator.validate(relatie, { logger: newLogger() }).problems).toEqual([
      {
        path: 'Client.Relatie.Partner.BurgerServiceNr',
        segments: ['Client', 'Relatie', 'Partner', 'BurgerServiceNr'],
        code: 'missing',
        detail: 'Field is required',
      },
      {
        path: 'Client.Relatie.Partner',
        segments: ['Client', 'Relatie', 'Partner'],
        code: 'unrecognized_keys',
        detail: 'Unrecognized key: "Relatie"',
      },
      {
        path: 'Client.BijstandspersoonOverig[1].Geboortedatum',
        segments: ['Client', 'BijstandspersoonOverig', 1, 'Geboortedatum'],
        code: 'invalid_format',
        detail: 'Expected a date as YYYYMMDD',
      },
    ]);
  });

  it('reports the order of the current mapper and a phone number with a dash', () => {
    captureLogs();
    const result = validator.validate(production, { logger: newLogger() });
    expect(result.status).toBe('invalid');
    expect(result.problems.map((problem) => [problem.path, problem.code])).toEqual([
      ['Client.Telefoonnr[0].Abonneenr', 'invalid_format'],
      ['AardVerzoek', 'order'],
      ['Client.Geboortedatum', 'order'],
    ]);
  });

  it('keeps personal data out of non-debug lines and tags every line', () => {
    const logs = captureLogs();
    validator.validate(errors, { logger: newLogger(), context: { mode: 'dry-run' } });
    validator.validate(client, { logger: newLogger(), context: { mode: 'dry-run' } });
    validator.validate(adresTelefoon, { logger: newLogger(), context: { mode: 'dry-run' } });
    for (const personalData of ['verzonnen toelichting', '12345678', 'Verzonnen1', 'Verzonnenstraatnaam', '9999 ZZ', '9999999X']) {
      const contains = (line: LogLine) => JSON.stringify(line).includes(personalData);
      expect(logs.filter((line) => line.level !== 'DEBUG').some(contains)).toBe(false);
      expect(logs.filter((line) => line.level === 'DEBUG').some(contains)).toBe(true);
    }
    for (const line of logs) {
      expect(line).toMatchObject({ zaakIdentificatie: expect.stringMatching(/^OF-TEST-000[245]$/), context: { mode: 'dry-run' } });
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
