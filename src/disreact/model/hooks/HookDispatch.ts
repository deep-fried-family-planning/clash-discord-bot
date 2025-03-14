import * as Unsafe from '#src/disreact/model/hooks/unsafe.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import {type FiberNode, TaskElement} from 'src/disreact/codec/element/index.ts';
import * as Hook from './Hook.ts';



export class HookDispatch extends E.Service<HookDispatch>()('DisReact.HookDispatcher', {
  effect: E.gen(function* () {
    const semaphore = yield* E.makeSemaphore(1);

    return {
      mutex: (node: FiberNode.FiberNode) =>
        pipe(
          E.sync(() => {
            Unsafe.UNSAFE_setNode(node);
            Unsafe.UNSAFE_setRoot(node.root as any);
          }),
          E.andThen(() => TaskElement.renderEffect(node.element!)),
          semaphore.withPermits(1),
        ),
    };
  }),
  accessors: true,
}) {
  static readonly impl = {
    useState  : Hook.$useState,
    useReducer: Hook.$useReducer,
    useEffect : Hook.$useEffect,
    usePage   : Hook.$useMessage,
    useIx     : Hook.$useIx,
  };
}

// const thing = HookDispatcher.pipe(E.map((hookDispatcher) => {
//   hookDispatcher.mutex();
// }));

// const thing = E.gen(function* () {
//   const thing2 = yield* HookDispatch.mutex();
//
//   yield* thing2(E.void);
// });


//
// export class HookDispatcher extends E.Tag(HOOK_DISPATCHER_TAG)<
//   HookDispatcher,
//   {
//     mutex: () => <A, E, R>(node: FiberNode.T, effect: E.Effect<A, E, R>) => E.Effect<A, E, R>;
//   }
// >() {
//   static readonly Live       = L.effect(this, E.suspend(() => make));
//   static readonly useState   = UseState.hook;
//   static readonly useReducer = UseReducer.hook;
//   static readonly useEffect  = UseEffect.hook;
//   static readonly usePage    = UsePage.hook;
//   static readonly useIx      = UseIx.hook;
// }
