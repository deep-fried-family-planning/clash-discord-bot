import * as Schema from 'effect/Schema';

export const Text = Schema.Union(
  Schema.Null,
  Schema.Undefined,
  Schema.Boolean,
  Schema.Number,
  Schema.BigInt,
  Schema.String,
);

export const OrText = <A extends Schema.Schema.Any>(self: A) => Schema.Union(self, Text);

export const Attributes = <A extends Schema.Struct.Fields>(fields: A) =>
  Schema.Struct(fields);
