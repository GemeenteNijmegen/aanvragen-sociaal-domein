import { z } from 'zod';
import { OrderIssue } from './fieldOrder';

/**
 * The issue code of zod, such as `too_big` or `unrecognized_keys`, plus two of our own:
 *
 * - `missing`: a required field is absent. Zod reports this as `invalid_type`, which also means a wrong type.
 * - `order`: a field is in the wrong place. Zod does not check the order.
 */
export type ProblemCode = z.core.$ZodIssue['code'] | 'missing' | 'order';

export interface ProblemLimit {
  min?: number;
  max?: number;
  allowed?: string[];
}

export interface Problem {
  path: string;
  segments: (string | number)[];
  code: ProblemCode;
  detail: string;
  limit?: ProblemLimit;
}

export interface ProblemWithValue {
  problem: Problem;
  value?: unknown;
}

/**
 * Turns zod issues and order issues into problems. Zod issues must come from safeParse with `reportInput: true`.
 *
 * Zod messages contain no input values, so detail never holds personal data. The value is returned apart, for the debug log only.
 */
export function toProblems(rootName: string, issues: z.core.$ZodIssue[], orderIssues: OrderIssue[]): ProblemWithValue[] {
  const fieldProblems = issues.map((issue): ProblemWithValue => {
    const location = locationOf(issue.path, rootName);
    if (issue.code === 'invalid_type' && issue.input === undefined) {
      return { problem: { ...location, code: 'missing', detail: 'Field is required' } };
    }
    if (issue.code === 'unrecognized_keys') {
      const object = issue.input as Record<string, unknown>;
      const unknownValues = Object.fromEntries(issue.keys.map((key) => [key, object[key]]));
      return { problem: { ...location, code: issue.code, detail: issue.message }, value: unknownValues };
    }
    const limit = limitOf(issue);
    return { problem: { ...location, code: issue.code, detail: issue.message, ...(limit ? { limit } : {}) }, value: issue.input };
  });
  const orderProblems = orderIssues.map((issue): ProblemWithValue => {
    const detail = `Must come after ${issue.expectedBefore}. Expected order: ${issue.expectedOrder.join(', ')}`;
    return { problem: { ...locationOf(issue.path, rootName), code: 'order', detail } };
  });
  return [...fieldProblems, ...orderProblems];
}

function limitOf(issue: z.core.$ZodIssue): ProblemLimit | undefined {
  switch (issue.code) {
    case 'too_big':
      return { max: Number(issue.maximum) };
    case 'too_small':
      return { min: Number(issue.minimum) };
    case 'invalid_value':
      return { allowed: issue.values.map(String) };
    default:
      return undefined;
  }
}

function locationOf(path: readonly PropertyKey[], rootName: string): Pick<Problem, 'path' | 'segments'> {
  const segments = path.map((key) => (typeof key === 'number' ? key : String(key)));
  return { path: segments.length ? z.core.toDotPath(segments) : rootName, segments };
}
