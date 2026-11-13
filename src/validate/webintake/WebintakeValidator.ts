import { z } from 'zod';
import { MessageValidator, ValidationOptions, ValidationResult } from '../MessageValidator';
import { MessageDefinition, validateMessage } from '../validateMessage';
import { webintake } from './schema/webintake';

export type { MessageValidator, Problem, ProblemCode, ProblemLimit, ValidationOptions, ValidationResult } from '../MessageValidator';

const withZaakIdentificatie = z.looseObject({ ZaakIdentificatie: z.string() });

const definition: MessageDefinition = {
  name: 'Webintake',
  component: 'webintake-validation',
  schema: webintake,
  checkOrder: true,
  groupingKey: (message) => ({ zaakIdentificatie: withZaakIdentificatie.safeParse(message).data?.ZaakIdentificatie ?? 'unknown' }),
};

/**
 * Validates a Webintake message, including the field order.
 *
 * Default grouping key: `zaakIdentificatie` from the message, or `unknown` when it is missing. Pass logKeys only to override it.
 */
export class WebintakeValidator implements MessageValidator {
  validate(input: unknown, options: ValidationOptions): ValidationResult {
    return validateMessage(input, definition, options);
  }
}
