/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {ASYNC_FUNCTION} from '#src/disreact/codec/common/_tag.ts';
import {_Tag} from '#src/disreact/codec/common/index.ts';
import * as Children from '#src/disreact/codec/component/children.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import {isPromise} from 'effect/Predicate';



export type T<P, A> =
  Function
  & {
    (props: P):
      | A
      | Promise<A>
      | E.Effect<A>;

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

export const guessAsync = (self: FC) => {
  if (self.constructor.name === ASYNC_FUNCTION) {
    self.isAsync = true;
  }
  return self;
};

// export const resolveKind = (self: FC) => {
//   if (self.isSync) return _Tag.SYNC;
//   if (self.isEffect) return _Tag.EFFECT;
//   if (self.constructor.name === _Tag.ASYNC_FUNCTION) return _Tag.ASYNC;
//   return _Tag.SYNC_OR_EFFECT;
// };

export const render = (self: FC, props: Parameters<FC>[0]) => E.gen(function* () {
  if (self.isSync)
    return Children.normalize(self(props));

  if (self.isAsync) {
    return yield* pipe(
      E.tryPromise(async () => await self(props)),
      E.map((children) => Children.normalize(children)),
    );
  }

  if (self.isEffect) {
    return yield* pipe(
      self(props) as E.Effect<any>,
      E.map((children) => Children.normalize(children)),
    );
  }

  const output = self(props);

  if (isPromise(output)) {
    self.isAsync = true;

    return yield* pipe(
      E.tryPromise(async () => await self(props)),
      E.map((children) => Children.normalize(children)),
    );
  }

  if (E.isEffect(output)) {
    self.isEffect = true;

    const children = yield* output as E.Effect<any>;

    return Children.normalize(children);
  }

  self.isSync = true;

  return Children.normalize(output);
});
