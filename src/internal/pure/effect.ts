import {Order} from 'effect';


export {
  Effect as E,
  Console as CSL,
  Data as D,
  DateTime as DT,
  Redacted as RDT,
  Config as CFG,
  Context as CTX,
  Layer as L,
  Cache as C,
  Logger as Logger,
  LogLevel,
  LogSpan,
  Schema as S,
  Brand as B,
  RateLimiter as RL,
  Metric as Metric,
  Order as ORD,
  Option as O,
  Equal as EQ,

  Cron,

  pipe,
  pipe as p,
  flow,
  flow as f,

} from 'effect';


export {
  gen as g,

} from 'effect/Effect';


export const ORDS  = Order.string;
export const ORDSR = Order.reverse(Order.string);
export const ORDN  = Order.number;
export const ORDNR = Order.reverse(Order.number);


export * as Ar from 'effect/Array'; // collection array
export * as AR from 'effect/Array'; // collection array
export * as Arr from 'effect/Array'; // collection array
export * as ARR from 'effect/Array'; // collection array
export * as Kv from 'effect/Record'; // collection key-value
export * as KV from 'effect/Record'; // collection key-value
export * as Rec from 'effect/Record'; // collection key-value
export * as REC from 'effect/Record'; // collection key-value
export * as Sr from 'effect/Struct'; // collection key-value
export * as SR from 'effect/Struct'; // collection key-value
