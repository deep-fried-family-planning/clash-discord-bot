import * as Arr from 'effect/Array'
import * as BI from 'effect/BigInt'
import * as Data from 'effect/Data'
import * as D from 'effect/Data'
import * as DF from 'effect/Deferred'
import * as E from 'effect/Effect'
import * as EI from 'effect/Either'
import * as EQ from 'effect/Equal'
import * as EX from 'effect/Exit'
import * as FS from 'effect/FiberSet'
import * as Hash from 'effect/Hash'
import * as L from 'effect/Layer'
import * as LI from 'effect/List'
import * as MB from 'effect/Mailbox'
import * as ML from 'effect/MutableList'
import * as O from 'effect/Option'
import * as S from 'effect/Schema'
import * as SR from 'effect/SubscriptionRef'
import * as ST from 'effect/Stream'
import * as F from 'effect/Fiber'
import * as RDT from 'effect/Redacted'
import * as DT from 'effect/DateTime'
import * as DR from 'effect/Duration'

export {
  Arr,
  BI,
  Data,
  D,
  DF,
  E,
  EI,
  EQ,
  EX,
  FS,
  Hash,
  L,
  LI,
  MB,
  ML,
  O,
  S,
  SR,
  ST,
  RDT,
  F,
  DT,
  DR,
}

export {
  pipe,
} from 'effect/Function'

export type RT<A extends (...args: any) => any> = ReturnType<A>
