import type * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import {globalValue} from 'effect/GlobalValue';

export type Entrypoint = | Jsx.Jsx
                         | Jsx.FC;

export type Lookup = | Entrypoint
                     | string;

export const getId = (lookup?: Lookup) =>
  !lookup ? undefined :
  typeof lookup === 'string' ? lookup :
  typeof lookup === 'function' ? lookup.entrypoint :
  lookup.entrypoint;

const registry = globalValue(Symbol.for('disreact/registry'), () => new Map<string, Entrypoint>());

export const isRegistered = (lookup?: Lookup): lookup is NonNullable<Lookup> =>
  !lookup ? false :
  registry.has(getId(lookup)!);

export const get = (lookup: Lookup) => registry.get(getId(lookup)!)!;

export const register = <A extends Jsx.FC>(id: string, source: A): A => {
  if (registry.has(id)) {
    throw new Error(`Duplicate registration: ${id}`);
  }
  registry.set(id, source); // todo
  (source.entrypoint as any) = id;
  return source;
};
