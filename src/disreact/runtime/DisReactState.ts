import {D, DT, E, L, pipe} from '#src/disreact/utils/re-exports.ts'
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts'
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts'
import type {Doken} from '../codec/doken'

export class DisReactState extends E.Service<DisReactState>()('disreact/State', {
  effect: E.map(DT.now, (now) => {
    return {}
  }),
}) {
  static readonly Fresh = L.suspend(() => L.fresh(DisReactState.Default))
}

export class ExpiryFailure extends D.TaggedError('disreact/DeferFailure')<{}> {}
