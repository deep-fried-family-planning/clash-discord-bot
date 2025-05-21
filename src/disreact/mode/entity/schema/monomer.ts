import * as S from 'effect/Schema';

export declare namespace Monomer {
  export type Null = typeof Null.Type;
  export type State = typeof State.Type;
  export type Dep = typeof Dep.Type;
  export type Monomer = | Null
                        | State
                        | Dep;
}
export type Null = Monomer.Null;
export type State = Monomer.State;
export type Dep = Monomer.Dep;
export type Monomer = Monomer.Monomer;

export const Null = S.Null;
export const State = S.Struct({s: S.Any}).pipe(S.mutable);
export const Dep = S.Struct({d: S.Any}).pipe(S.mutable);
export const Monomer = S.Union(
  Null,
  State,
  Dep,
);
