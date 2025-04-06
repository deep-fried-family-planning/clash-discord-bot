import {Codec} from '#src/disreact/codec/Codec.ts'
import {FC} from '#src/disreact/model/comp/fc.ts'
import type {Elem} from '#src/disreact/model/entity/elem.ts'
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {E, RDT} from '#src/disreact/utils/re-exports.ts'
import {Lifecycles} from '#src/disreact/model/lifecycles.ts'
import { Fibril } from '#src/disreact/model/comp/fibril.ts'

type Id = Elem | FC | string

const getId = (component: Id) => {
  if (typeof component === 'string') {
    return component
  }
  if (typeof component === 'object') {
    return 'nope'
  }
  return FC.getSrcId(component)
}

export const synthesize = (component: Id, props?: any) => E.gen(function* () {
  const registry = yield* SourceRegistry
  const root = yield* registry.checkout(
    getId(component),
    props,
  )

  yield* Lifecycles.initialize(root)

  const encoded = yield* Codec.encodeRoot(root)

  const parameterized = yield* Codec.encodeRoute([
    {
      doken: {
        _tag: 'Spent',
        id  : 'a',
        type: 4,
        flag: 2,
        val : RDT.make('-'),
      },
      hydrant: Fibril.encodeNexus(root.nexus),
    },
    encoded.message[0],
  ])

  return parameterized
})
