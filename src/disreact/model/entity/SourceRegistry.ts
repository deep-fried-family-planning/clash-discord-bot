import {DsxSettings} from '#src/disreact/DisReactConfig.ts'
import {FC} from '#src/disreact/model/entity/comp/fc.ts'
import {Elem} from '#src/disreact/model/entity/elem/elem.ts'
import {Root} from '#src/disreact/model/entity/root.ts'
import {Arr, Data, E, Hash} from '#src/disreact/re-exports.ts'


export class SourceDefect extends Data.TaggedError('disreact/SourceDefect')<{
  message?: string
  why?    : string
  cause?  : Error
}> {}

const STORE = new Map<string, Root.Source>()

export class SourceRegistry extends E.Service<SourceRegistry>()('disreact/SourceRegistry', {
  accessors: true,

  effect: DsxSettings.use((config) => {
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

    const checkout = (key: string | FC | Elem.Task, props?: any) => {
      const id = typeof key === 'string' ? key
        : Elem.isTask(key) ? FC.getSrcId(key.type)
          : FC.getSrcId(key)

      const src = STORE.get(id)

      if (!src) {
        return E.fail(new SourceDefect({message: `Unregistered Source: ${key}`}))
      }

      return E.succeed(Root.fromSource(src, props))
    }

    const version = config.version
      ? `${config.version}`
      : Hash.array(Arr.map(sources, (src) => src.id))

    return E.succeed({
      checkout,
      version,
    })
  }),
}) {}
