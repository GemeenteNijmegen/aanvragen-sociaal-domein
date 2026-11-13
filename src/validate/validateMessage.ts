import { z } from 'zod';
import { checkFieldOrder, fieldOrderOf } from './fieldOrder';
import { ValidationOptions, ValidationResult } from './MessageValidator';
import { toProblems } from './problems';

/**
 * Describes one kind of message for validateMessage. Each MessageValidator has one.
 */
export interface MessageDefinition {
  /**
   * Name of the message, used in log messages and as path of problems on the message itself.
   *
   * @example 'Webintake'
   */
  name: string;

  /**
   * Added as `component` to every log line.
   *
   * @example 'webintake-validation'
   */
  component: string;

  /**
   * Zod schema for the fields. Use a strict object so unknown fields are reported.
   */
  schema: z.ZodType;

  /**
   * Checks the field order of the raw input against the order in which the fields are written in the schema, for every object.
   *
   * Only for messages where the order matters. Default `false`.
   */
  checkOrder?: boolean;

  /**
   * Returns the default key that groups all log lines of one message, taken from the message itself. `logKeys` in the options win over it.
   *
   * Return `unknown` as value when the message does not contain the key. Name the default in the JSDoc of the validator class, so callers
   * know whether they need to pass `logKeys`.
   *
   * @example
   * const withZaakIdentificatie = z.looseObject({ ZaakIdentificatie: z.string() });
   * (message) => ({ zaakIdentificatie: withZaakIdentificatie.safeParse(message).data?.ZaakIdentificatie ?? 'unknown' })
   */
  groupingKey?: (input: unknown) => Record<string, unknown>;
}

/**
 * Runs the zod schema and, when given, the order check, then logs and returns all problems.
 *
 * Shared by all validators. Never throws: an error in the validator itself gives status `error`.
 */
export function validateMessage(input: unknown, definition: MessageDefinition, options: ValidationOptions): ValidationResult {
  const logger = options.logger.createChild();
  const { name } = definition;
  try {
    logger.appendKeys({
      component: definition.component,
      ...definition.groupingKey?.(input),
      ...options.logKeys,
      ...(options.context ? { context: options.context } : {}),
    });
    const parsed = definition.schema.safeParse(input, { reportInput: true });
    const issues = parsed.success ? [] : parsed.error.issues;
    const order = definition.checkOrder ? fieldOrderOf(definition.schema) : undefined;
    const orderIssues = order ? checkFieldOrder(order, input) : [];
    const entries = toProblems(name, issues, orderIssues);
    if (!entries.length) {
      logger.info(`${name} valid`);
      return { status: 'valid', problems: [] };
    }
    for (const { problem, value } of entries) {
      logger.warn(`${name} problem`, { path: problem.path, code: problem.code, detail: problem.detail, limit: problem.limit });
      if (value !== undefined) {
        logger.debug(`${name} problem value`, { path: problem.path, value });
      }
    }
    const problems = entries.map((entry) => entry.problem);
    const problemCodes: Record<string, number> = {};
    for (const { code } of problems) {
      problemCodes[code] = (problemCodes[code] ?? 0) + 1;
    }
    logger.warn(`${name} invalid`, { problemCount: problems.length, problemCodes, paths: problems.map((problem) => problem.path) });
    return { status: 'invalid', problems };
  } catch (error) {
    logger.error(`${name} validation failed`, { error });
    return { status: 'error', problems: [] };
  }
}
