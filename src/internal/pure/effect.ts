import {Order} from 'effect';
import * as Ar from 'effect/Array'; // collection array
import * as AR from 'effect/Array'; // collection array
import * as Arr from 'effect/Array'; // collection array
import * as ARR from 'effect/Array'; // collection array
import * as Kv from 'effect/Record'; // collection key-value
import * as KV from 'effect/Record'; // collection key-value
import * as Rec from 'effect/Record'; // collection key-value
import * as REC from 'effect/Record'; // collection key-value
import * as Sr from 'effect/Struct'; // collection key-value
import * as SR from 'effect/Struct'; // collection key-value


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


export {
  Ar,
  AR,
  Arr,
  ARR,
  Kv,
  KV,
  Rec,
  REC,
  Sr,
  SR,
};
