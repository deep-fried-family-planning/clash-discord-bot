import type * as Jsx from '#disreact/runtime/Jsx.tsx';
import * as GlobalValue from 'effect/GlobalValue';

export type Entrypoint = | Jsx.Jsx
                         | Jsx.FC;

export type Lookup = | Entrypoint
                     | string;

const registry = GlobalValue.globalValue(Symbol.for('disreact/registry'), () => new Map<string, Entrypoint>());

export const getId = (lookup?: Lookup) =>
  !lookup ? undefined :
  typeof lookup === 'string' ? lookup :
  typeof lookup === 'function' ? lookup.entrypoint :
  lookup.entrypoint;

export const isRegistered = (lookup?: Lookup): lookup is NonNullable<Lookup> =>
  !lookup ? false :
  registry.has(getId(lookup)!);

export const register = <A extends Jsx.FC>(id: string, source: A): A => {
  if (registry.has(id)) {
    throw new Error(`Duplicate registration: ${id}`);
  }
  registry.set(id, source); // todo
  return source;
};

export const get = (lookup: Lookup) => registry.get(getId(lookup)!)!;
