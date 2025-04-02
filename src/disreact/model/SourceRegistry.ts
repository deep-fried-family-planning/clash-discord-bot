import {DsxSettings} from '#src/disreact/runtime/DisReactConfig.ts'
import {FC} from '#src/disreact/model/entity/fc.ts'
import {Elem} from '#src/disreact/model/entity/elem.ts'
import {Root} from '#src/disreact/model/entity/root.ts'
import {Arr, Data, E, Hash} from '#src/disreact/re-exports.ts'
import type {Fibril} from './fibril/fibril'


export class SourceDefect extends Data.TaggedError('disreact/SourceDefect')<{
  message?: string
  why?    : string
  cause?  : Error
}> {}

const STORE = new Map<string, Root.Source>()

export class SourceRegistry extends E.Service<SourceRegistry>()('disreact/SourceRegistry', {
  accessors: true,

  effect: E.andThen(DsxSettings, (config) => {
    const sources = [
      ...config.sources.modal.map((src) => Root.make(Root.MODAL, src)),
      ...config.sources.public.map((src) => Root.make(Root.PUBLIC, src)),
      ...config.sources.ephemeral.map((src) => Root.make(Root.EPHEMERAL, src)),
    ]

    for (const src of sources) {
      // if (ξ.has(src.id)) {
      //   return E.die(new SourceDefect({why: `Duplicate Source: ${src.id}`}));
      // }
      STORE.set(src.id, src)
    }

    const version = config.version
      ? `${config.version}`
      : Hash.array(Arr.map(sources, (src) => src.id))

    const checkout = (key: string | FC | Elem.Task, props: any = {}) => {
      const id = typeof key === 'string' ? key
        : Elem.isTask(key) ? FC.getSrcId(key.type)
          : FC.getSrcId(key)

      const src = STORE.get(id)

      if (!src) {
        return E.fail(new SourceDefect({message: `Unregistered Source: ${key}`}))
      }

      return E.succeed(Root.fromSource(src, props))
    }

    const fromHydrant = (hydrant: Fibril.Hydrant) => {
      const src = STORE.get(hydrant.id)

      if (!src) {
        return E.fail(new SourceDefect({message: `Unregistered Source: ${hydrant.id}`}))
      }

      return E.succeed(Root.fromSourceHydrant(src, hydrant))
    }

    return E.succeed({
      fromHydrant,
      checkout,
      version,
    })
  }),
}) {}
