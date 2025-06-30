import type {EFFECT, SYNC} from '#src/disreact/core/primitives/constants.ts';
import {ANONYMOUS, ASYNC, type FCExecution, INTERNAL_ERROR} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as t from '#src/disreact/core/behaviors/type.ts';
import type * as Jsx from '#src/disreact/runtime/jsx.tsx';
import type * as E from 'effect/Effect';

interface Internal {
  _id?        : string;
  _tag?       : FCExecution;
  displayName?: string;
}

export interface Known<A = any, B = Jsx.Children> extends t.Fn, Internal {
  (props: A): B | Promise<B> | E.Effect<B, any, any>;
}

export interface Sync<A = any, B = Jsx.Children> extends t.Fn, Internal {
  _tag: typeof SYNC;
  (props: A): B;
}

export interface Async<A = any, B = Jsx.Children> extends t.Fn, Internal {
  _tag: typeof ASYNC;
  (props: A): Promise<B>;
}

export interface Effect<A = any, B = Jsx.Children> extends t.Fn, Internal {
  _tag: typeof EFFECT;
  (props: A): E.Effect<B>;
}

export interface FC<P = any, O = Jsx.Children, E = any, R = any> extends t.Fn {
  (props: P): O | Promise<O> | E.Effect<O, E, R>;
  displayName?: string;
}

export const isFC = (u: unknown): u is FC => typeof u === 'function';

export const isKnown = (u: FC): u is Known => !!(u as any)._tag;

const Prototype = proto.type<Known>({
  _id: ANONYMOUS,
});

export const isCasted = (self: FC): self is Known => !!(self as Known)._tag;

export const register = (fn: FC): Known => {
  if (isKnown(fn)) {
    return fn;
  }
  const fc = proto.impure(Prototype, fn);

  fc._id = fc.displayName ? fc.displayName :
           fc.name ? fc.name :
           ANONYMOUS;

  return proto.isAsync(fc)
         ? cast(fc, ASYNC)
         : fc;
};

export const cast = (self: FC, type: FCExecution) => {
  if (isCasted(self)) {
    throw new Error(`Cannot recast function component: ${name(self)}`);
  }
  return Object.defineProperty(self, '_tag', {
    value       : type,
    writable    : false,
    configurable: false,
    enumerable  : true,
  });
};

export const isAnonymous = (self: FC) => name(self) === ANONYMOUS;

export const overrideName = (self: FC, name: string) => {
  (self as any)._id = name;
};

export const name = (maybe?: string | FC) => {
  if (!maybe) {
    return ANONYMOUS;
  }
  if (!isFC(maybe)) {
    return maybe;
  }
  if (!isKnown(maybe)) {
    throw new Error(INTERNAL_ERROR);
  }
  return (maybe as any)._id as string;
};

export const kind = (fc: FC): number | undefined => (fc as Known)._tag;
