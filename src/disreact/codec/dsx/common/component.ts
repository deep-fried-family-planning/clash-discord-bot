/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {E} from '#src/internal/pure/effect.ts';
import {_Tag} from '#src/disreact/codec/common/index.ts';
import * as Children from '#src/disreact/codec/dsx/common/children.ts';
import * as utiltypes from 'util/types';



export type T<P, A> =
  Function
  & {
    (props: P): A | Promise<A> | E.Effect<A>;
    displayName?: string;
    root_id?    : string;
    isSync?     : boolean;
    isAsync?    : boolean;
    isEffect?   : boolean;
  };

export type FC<P = any, A = any> = T<P, A>;

export type PFC<P = any, A = any> = T<{ readonly [K in keyof P]: P[K] }, A>;

export const resolveName = (self: FC) =>
  self.displayName ||
  self.name ||
  _Tag.ANONYMOUS;

export const resolveRootId = (self: FC) =>
  self.root_id ||
  self.displayName ||
  self.name;

export const resolveKind = (self: FC) => {
  if (self.isSync) return _Tag.SYNC;
  if (self.isEffect) return _Tag.EFFECT;
  if (self.constructor.name === _Tag.ASYNC_FUNCTION) return _Tag.ASYNC;
  return _Tag.SYNC_OR_EFFECT;
};

export const render = (self: FC, props: Parameters<FC>[0]) => E.gen(function* () {
  if (self.isSync) {
    return Children.normalize(self(props));
  }
  if (self.isAsync) {
    const children = yield* E.tryPromise(async () => await self(props));

    return Children.normalize(children);
  }
  if (self.isEffect) {
    const children = yield* self(props) as E.Effect<any>;

    return Children.normalize(children);
  }

  const unknownOutput = self(props);

  if (utiltypes.isPromise(unknownOutput)) {
    const children = yield* E.tryPromise(async () => await unknownOutput);

    self.isAsync = true;

    return Children.normalize(children);
  }

  if (E.isEffect(unknownOutput)) {
    const children = yield* unknownOutput as E.Effect<any>;

    self.isEffect = true;

    return Children.normalize(children);
  }

  self.isSync = true;

  return Children.normalize(unknownOutput);
});
