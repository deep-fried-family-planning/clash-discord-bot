import {E} from '#src/disreact/re-exports.ts'
import {UseEffect} from '#src/disreact/model/hooks/use-effect.ts'
import {UseReducer} from '#src/disreact/model/hooks/use-reducer.ts'
import {UseUtility} from '#src/disreact/model/hooks/use-utility.ts'


export class HooksDispatcher extends E.Service<HooksDispatcher>()('disreact/Dispatcher', {
  effect: E.map(E.makeSemaphore(1), (semaphore) => {
    return {
      lock  : semaphore.take(1),
      unlock: semaphore.release(1),
    }
  }),
  accessors: false,
}) {
  static readonly impl = {
    useState  : UseReducer.state,
    useReducer: UseReducer.reducer,
    useEffect : UseEffect.hook,
    usePage   : UseUtility.message,
    useIx     : UseUtility.interaction,
  }
}
