import {E, L} from '#src/disreact/codec/re-exports.ts'

export class DisReactState extends E.Service<DisReactState>()('disreact/State', {
  sync: () => {
    return {

    }
  },
}) {
  static readonly Fresh = L.fresh(DisReactState.Default)
}
