import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as MutableRef from 'effect/MutableRef';
import type * as Option from 'effect/Option';

const TypeId = Symbol.for('disreact/positional');

export interface Positional {
  __positional<A>(this: A): MutableRef.MutableRef<Option.Option<A>>;
}
