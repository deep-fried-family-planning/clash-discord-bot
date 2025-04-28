import {Order} from 'effect';

export {
  Effect as E,
  Fiber,
  Console as CSL,
  Data as D,
  DateTime as DT,
  Duration as DR,
  Redacted as RDT,
  Config as CFG,
  Context as CTX,
  Layer as L,
  Cache as C,
  Logger as Logger,
  Logger as LG,
  LogLevel,
  LogLevel as LL,
  LogSpan,
  Schema as S,
  Brand as B,
  RateLimiter as RL,
  Metric as Metric,
  Order as ORD,
  Option as O,
  Option as OPT,
  Equal as EQ,
  Deferred as DFR,
  Either as LR,
  Cron,
  FiberMap as FM,
  Match as M,

  pipe,
  pipe as p,
  flow,
  flow as f,

} from 'effect';

export {
  gen as g,

} from 'effect/Effect';

export {
  compose,
  hole as forbiddenTransform,
} from 'effect/Function';

export const ORDS = Order.string;
export const ORDSR = Order.reverse(Order.string);
export const ORDN = Order.number;
export const ORDNR = Order.reverse(Order.number);

export * as Ar from 'effect/Array'; // collection array
export * as Kv from 'effect/Record'; // collection key-value
