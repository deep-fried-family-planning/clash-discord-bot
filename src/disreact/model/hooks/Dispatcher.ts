import {E} from '#src/disreact/re-exports.ts'
import {UseEffect} from '#src/disreact/model/hooks/use-effect.ts'
import {UseReducer} from '#src/disreact/model/hooks/use-reducer.ts'
import {UseUtility} from '#src/disreact/model/hooks/use-utility.ts'


export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  accessors: false,

  effect: E.map(E.makeSemaphore(1), (semaphore) => {
    return {
      lock  : semaphore.take(1),
      unlock: semaphore.release(1),

      // mutex: (node: Fibril.Strand) => <A, E, R>(effect: E.Effect<A, E, R>) => {
      //   return pipe(
      //     semaphore.take(1),
      //     E.andThen(() => {
      //       Fibril.λ.set(node)
      //       return effect
      //     }),
      //     E.tap(() => {
      //       Fibril.λ.clear()
      //       return semaphore.release(1)
      //     }),
      //     E.catchAll((e) => {
      //       Fibril.λ.clear()
      //       return pipe(
      //         E.fail(e as HookError),
      //         E.tap(() => semaphore.release(1)),
      //       )
      //     }),
      //   )
      // },
    }
  }),
}) {
  // static readonly withMutex = (node: Fibril.Strand) => <A, E, R>(effect: E.Effect<A, E, R>) =>
  //   pipe(
  //     Dispatcher.use((dispatch) => dispatch.mutex(node)(effect)),
  //   )

  static readonly impl = {
    useState  : UseReducer.state,
    useReducer: UseReducer.reducer,
    useEffect : UseEffect.hook,
    usePage   : UseUtility.message,
    useIx     : UseUtility.interaction,
  }
}
