import { Logger } from '@aws-lambda-powertools/logger';
import { Problem } from './problems';

export type { Problem, ProblemCode, ProblemLimit } from './problems';

/**
 * Checks the form of one message. Every problem is logged and returned, so the caller can act on it.
 *
 * @example
 * const validator: MessageValidator = new WebintakeValidator();
 * const result = validator.validate(message, { logger, logKeys: { zaakIdentificatie: 'OF-1234' } });
 *
 * @example
 * // Dry run: validate next to the existing flow and only log, the caller does nothing with the result.
 * // Every log line gets context: { mode: 'dry-run' }, so these lines can be found and filtered in the logs.
 * validator.validate(message, { logger, context: { mode: 'dry-run' } });
 */
export interface MessageValidator {
  /**
   * Validates the message and reports all problems at once.
   *
   * Never throws, also not when the validator itself fails, and never changes the input.
   * Field values are only logged at debug level.
   *
   * @param input The message as received. Any value is accepted, also `undefined` or `null`.
   * @param options Logger, and optionally context and log keys.
   * @returns `valid`, `invalid` with the problems, or `error` when the validator itself failed.
   */
  validate(input: unknown, options: ValidationOptions): ValidationResult;
}

export interface ValidationOptions {
  /**
   * Logger of the caller.
   *
   * Validation logs through a child of this logger, so the logger itself gets no extra keys.
   */
  logger: Logger;

  /**
   * Added as `context` to every log line, so lines of one kind of use can be told apart in the logs.
   *
   * @example
   * // Dry run: the validator runs next to the existing flow on real messages and the caller does nothing with the result.
   * // Shows which messages would be rejected and why, without risk, and shows false reports before the flow acts on them.
   * { mode: 'dry-run' }
   */
  context?: Record<string, unknown>;

  /**
   * Added to every log line.
   *
   * Each validator implementation can have a default grouping key taken from the message, see the JSDoc of that validator
   * (Webintake: `zaakIdentificatie`, or `unknown`). Without logKeys that default is used. Pass a key here only when the message does not
   * contain it, or to add keys such as a form reference. Keys given here win over the default.
   *
   * @example { zaakIdentificatie: 'OF-1234' }
   */
  logKeys?: Record<string, unknown>;
}

/**
 * Outcome of a validation.
 *
 * - `valid`: no problems.
 * - `invalid`: the message has problems, all of them in `problems`.
 * - `error`: the validator itself failed and the message was not judged.
 */
export type ValidationResult =
  | { status: 'valid'; problems: [] }
  | { status: 'invalid'; problems: Problem[] }
  | { status: 'error'; problems: [] };
