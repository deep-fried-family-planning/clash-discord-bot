import type {EffectFn} from '#disreact/entity/Fn.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';

export interface Monomer extends Inspectable.Inspectable {

}

export interface Reducer<S = any, A = any> extends Inspectable.Inspectable {
  _tag : 1;
  state: S;
  reducer(s: S, a: A): S;
  dispatch(a: A): void;
  init(): S;
}

type EffectorKind = | 'Sync'
                    | 'Async'
                    | 'EffectFn'
                    | 'Effect'
                    | undefined;

export interface Effector<K extends EffectorKind = EffectorKind, E = never, R = never> extends Inspectable.Inspectable {
  _tag : 2;
  kind?: K;
  deps?: undefined | any[];
  fx: K extends 'Effect'
      ? E.Effect<void, E, R>
      : never;
  fn(): K extends 'Sync' ? void :
        K extends 'Async' ? Promise<void> :
        K extends 'EffectFn' ? EffectFn :
        K extends 'Effect' ? never :
        | void
        | Promise<void>
        | E.Effect<void, E, R>;
}

export interface Reference<R> extends Inspectable.Inspectable {
  _tag   : 3;
  current: R;
}

export interface Memo<R> extends Inspectable.Inspectable {
  _tag: 4;
}

export interface Contextual extends Inspectable.Inspectable {
  _tag: 5;
}
