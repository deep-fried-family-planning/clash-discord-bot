import {FC} from '#src/disreact/model/entity/comp/fc.ts'
import type {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import {ElemEncoder} from '#src/disreact/model/entity/ElemEncoder.ts'
import {SourceRegistry} from '#src/disreact/model/entity/SourceRegistry.ts'
import {E} from '#src/disreact/re-exports.ts'
import { LifecycleGenML } from './lifecycle-gen-ml'

export * as Model from '#src/disreact/model/Model.ts'
export type Model = never

const getId = (component: Elem | FC | string) => {
  if (typeof component === 'string') {
    return component
  }
  if (typeof component === 'object') {
    return 'nope'
  }
  return FC.getSrcId(component)
}

export const synthesize = (component: Elem | FC | string, props?: any) => E.gen(function* () {
  const id = getId(component)
  const root = yield* SourceRegistry.checkout(id, props)

  yield* LifecycleGenML.initialize(root)

  const encoded = yield* ElemEncoder.encodeRoot(root)

  return encoded
})


// export class Model extends E.Tag('disreact/Model')<
//   Model,
//   {
//     hydrate : (root: string) => E.Effect<void>
//     dispatch: (event: any) => E.Effect<void>
//   }
// >() {}
