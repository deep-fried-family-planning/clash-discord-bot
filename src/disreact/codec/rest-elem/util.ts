import {Keys} from '#src/disreact/codec/rest-elem/keys.ts'
import {S} from '#src/disreact/codec/re-exports.ts'
import type {E} from '#src/internal/pure/effect.ts'

export * as Util from '#src/disreact/codec/rest-elem/util.ts'
export type Util = never

export const opt = S.optional

export const declareOnly = <A, I, R>(schema: S.Schema<A, I, R>) =>
  schema

export const declareMany = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.Array(schema)

export const declareChildren = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.Union(
    schema,
    S.Array(schema),
  )

export const declareEvent = <T extends string, F extends S.Struct.Fields, A, I, R>(
  tag: T,
  fields: S.Struct<F>,
  data: S.Schema<A, I, R>,
) =>
  S.Struct({
    _tag: S.tag(tag),
    id  : S.String,
    data,
    ...fields.fields,
  })

export const declareHandler = <A, I, R>(s: S.Schema<A, I, R>) =>
  S.declare(
    (h): h is(event: typeof s.Type) => void | Promise<void> | E.Effect<void, any, any> =>
      typeof h === 'function' &&
      h.length === 1,
  )

export const declareProps = <F extends S.Struct.Fields>(schema: S.Struct<F>) =>
  S.Struct({
    ...schema.fields,
    [Keys.children]: S.optional(S.Any),
  })

export const FuncElem = S.Struct({
  [Keys.type] : declareHandler(S.Any),
  [Keys.id]   : S.String,
  [Keys.ids]  : S.String,
  [Keys.props]: S.Any,
  [Keys.nodes]: S.Array(S.Any),
})

export const declareElem = <
  T extends string,
  A, I, R,
>(
  tag: T, props: S.Schema<A, I, R>,
) =>
  S.Struct({
    [Keys.type] : S.tag(tag),
    [Keys.id]   : S.String,
    [Keys.ids]  : S.String,
    [Keys.props]: props,
    [Keys.nodes]: S.Array(S.Any),
  } as const)

export const declareHandlerElem = <
  T extends string,
  A, I, R,
  A2, I2, R2,
>(
  tag: T, props: S.Schema<A, I, R>, event: S.Schema<A2, I2, R2>,
) =>
  S.Struct({
    [Keys.type]   : S.tag(tag),
    [Keys.id]     : S.String,
    [Keys.ids]    : S.String,
    [Keys.props]  : props,
    [Keys.nodes]  : S.Array(S.Any),
    [Keys.handler]: declareHandler(event),
  } as const)
