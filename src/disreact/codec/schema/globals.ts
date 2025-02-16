import {L, pipe} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';
import {Cache} from 'effect';
import {allocate} from 'effect/Array';
import * as E from 'effect/Effect';



const nullGlobalReferencePointer = Symbol('DisReact.GlobalReferencePointer.Null');

const globalReferencePointer = {current: null as null | symbol};

const globalHookStates = new WeakMap<symbol, {
  main      : any;
  components: Map<string, any>;
}>();

const globalHydrator = Cache.make({
  capacity  : 50,
  timeToLive: 5 * 60 * 1000,
  lookup    : () => E.fromNullable(null as null | symbol),
});


const make = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex = semaphore.withPermits(1);

  const hydrator = yield * globalHydrator;

  return {
    lock           : () => semaphore.take(1),
    unlock         : () => semaphore.release(1),
    youShallNotPass: () => mutex,

    setPointer: (id: symbol) => E.try(() => {
      if (globalReferencePointer.current === null) {
        globalReferencePointer.current = id;
      }
      throw new Error('Fatal: Global Reference Pointer already in use.');
    }),
    freePointer: () => {globalReferencePointer.current = null},
    nullPointer: () => {globalReferencePointer.current = nullGlobalReferencePointer},
    allocate   : (id: symbol, mainState: any) => globalHookStates.set(id, mainState),
    deallocate : (id: symbol) => globalHookStates.delete(id),
  };
});

export class GlobalReferenceSafety extends E.Tag('DisReact.GlobalReferenceSafety')<
  GlobalReferenceSafety,
  EA<typeof make>
>() {
  static acquireHooks() {
    if (globalReferencePointer.current === null) {
      throw new Error('Fatal: Global Reference Pointer is not set.');
    }

    return;
  }

  static lockForRender = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    GlobalReferenceSafety.youShallNotPass(),
    E.flatMap((permit) => permit(self)),
    E.provide(GlobalReferenceSafety.SingletonLive),
  );

  static SingletonLive = pipe(
    L.effect(this, make),
    L.memoize,
    L.unwrapEffect,
    L.extendScope,
  );
}
