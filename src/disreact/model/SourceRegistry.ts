import {DsxSettings} from '#src/disreact/interface/DisReactConfig.ts';
import type {TaskElem} from '#src/disreact/model/entity/element-task.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Array, Data, Hash, pipe} from 'effect';
import {Root} from './root';



export class SourceDefect extends Data.TaggedError('disreact/SourceDefect')<{
  message?: string;
  why?    : string;
  cause?  : Error;
}> {}

export class SourceRegistry extends E.Service<SourceRegistry>()('disreact/SourceRegistry', {
  accessors: true,

  effect: DsxSettings.use((config) => {
    const sources = [
      ...config.sources.modal.map((src) => Root.make(Root.MODAL, src)),
      ...config.sources.public.map((src) => Root.make(Root.PUBLIC, src)),
      ...config.sources.ephemeral.map((src) => Root.make(Root.EPHEMERAL, src)),
    ];

    for (const src of sources) {
      // if (Root.λ_λ.has(src.id)) {
      //   return E.die(new SourceDefect({why: `Duplicate Source: ${src.id}`}));
      // }
      Root.λ_λ.set(src.id, src);
    }

    return E.succeed({
      version:
        config.version
          ? `${config.version}`
          : pipe(
            sources,
            Array.map((src) => src.id),
            Hash.array,
          ),

      checkout: (key: string | FC | TaskElem) => {
        const id
                = typeof key === 'string' ? key
          : typeof key === 'function' ? FC.getSrcId(key)
            : key.id;

        const src = Root.λ_λ.get(id);

        if (!src) {
          return E.fail(new SourceDefect({message: `Unregistered Source: ${key}`}));
        }

        return E.succeed(Root.fromSource(src));
      },
    });
  }),
}) {}
