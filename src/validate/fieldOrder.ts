import { z } from 'zod';

export interface FieldOrder {
  fields: string[];
  choice: boolean;
  children: Map<string, FieldOrder>;
}

export interface OrderIssue {
  code: 'order';
  path: (string | number)[];
  expectedBefore: string;
  expectedOrder: string[];
}

export interface ChoiceIssue {
  code: 'choice';
  path: (string | number)[];
  found: string[];
  options: string[];
}

export type StructureIssue = OrderIssue | ChoiceIssue;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads the field order of every object in a zod schema, in the order the fields are written, and which objects are marked with
 * `.meta({ choice: true })`: exactly one of their fields must be present.
 *
 * Looks through optional fields and arrays. Other wrappers, such as nullable or a pipe, are not followed, so objects inside them get no order
 * or choice check.
 */
export function fieldOrderOf(schema: z.ZodType): FieldOrder | undefined {
  if (schema instanceof z.ZodOptional) {
    return fieldOrderOf(schema.unwrap() as z.ZodType);
  }
  if (schema instanceof z.ZodArray) {
    return fieldOrderOf(schema.element as z.ZodType);
  }
  if (!(schema instanceof z.ZodObject)) {
    return undefined;
  }
  const children = new Map<string, FieldOrder>();
  for (const [name, field] of Object.entries(schema.shape)) {
    const child = fieldOrderOf(field as z.ZodType);
    if (child) {
      children.set(name, child);
    }
  }
  return { fields: Object.keys(schema.shape), choice: schema.meta()?.choice === true, children };
}

// Runs on the raw input because the output of zod has its keys in schema order.
export function checkFieldOrder(order: FieldOrder, input: unknown, checkOrder: boolean, path: (string | number)[] = []): StructureIssue[] {
  if (!isRecord(input)) {
    return [];
  }
  const issues: StructureIssue[] = [];
  const orderIssue = checkOrder ? firstMisplaced(order, input, path) : undefined;
  if (orderIssue) {
    issues.push(orderIssue);
  }
  const found = order.fields.filter((name) => Object.hasOwn(input, name));
  if (order.choice && found.length !== 1) {
    issues.push({ code: 'choice', path, found, options: order.fields });
  }
  for (const [name, child] of order.children) {
    const value = input[name];
    if (Array.isArray(value)) {
      value.forEach((element, index) => issues.push(...checkFieldOrder(child, element, checkOrder, [...path, name, index])));
    } else {
      issues.push(...checkFieldOrder(child, value, checkOrder, [...path, name]));
    }
  }
  return issues;
}

function firstMisplaced(order: FieldOrder, input: Record<string, unknown>, path: (string | number)[]): OrderIssue | undefined {
  const known = new Set(order.fields);
  const actual = Object.keys(input).filter((key) => known.has(key));
  const expected = order.fields.filter((name) => Object.hasOwn(input, name));
  const index = actual.findIndex((key, i) => key !== expected[i]);
  if (index === -1) {
    return undefined;
  }
  return { code: 'order', path: [...path, actual[index]], expectedBefore: expected[index], expectedOrder: expected };
}
