import type * as Declarations from '#src/disreact/mode/schema/declarations.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';

export namespace Monomer {
  export type Null = typeof Declarations.Null.Type;
  export type State = typeof Declarations.State.Type;
  export type Dep = typeof Declarations.Dep.Type;
  export type Monomer = | Null
                        | State
                        | Dep;
}
export type Monomer = Monomer.Monomer;

export const isNull = (self: Monomer): self is Monomer.Null => self === null;
export const isState = (self: Monomer): self is Monomer.State => !!self && 's' in self;
export const isDep = (self: Monomer): self is Monomer.Dep => !!self && 'd' in self;

const nest = (data: any) => {
  if (!data || typeof data !== 'object' || Equal.symbol in data) return data;
  if (Array.isArray(data)) {
    const acc = [] as any[];
    for (const item of data) {
      acc.push(nest(item));
    }
    return Data.array(acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(data)) {
    acc[key] = nest(data[key]);
  }
  return Data.struct(acc);
};

const $null = (): Monomer.Null => null;
export {$null as null};
export const state = (s: any): Monomer.State => nest({s});
export const dep = (d: any = []): Monomer.Dep => nest(({d}));
export const chain = (c: Monomer[] = []) => Data.array(c) as Monomer[];
