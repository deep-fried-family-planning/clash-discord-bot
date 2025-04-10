import {FC} from '#src/disreact/model/entity/fc.ts';
import type {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Root} from '#src/disreact/model/entity/root.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {Arr, Data, E, Hash, pipe} from '#src/disreact/utils/re-exports.ts';

export type RegistryKey = string | FC | Elem;

const resolveId = (key: RegistryKey): string => {
  if (typeof key === 'string') {
    return key;
  }
  if (Elem.isTask(key)) {
    return FC.getSrcId(key.type);
  }
  if (Elem.isRest(key)) {
    throw new Error();
  }
  return FC.getSrcId(key);
};

export class RegistryDefect extends Data.TaggedError('disreact/RegistryException')<{
  message?: string;
  why?    : string;
  cause?  : Error;
}> {}

export class Registry extends E.Service<Registry>()('disreact/Registry', {
  effect: pipe(
    E.all({
      config: DisReactConfig,
    }),
    E.flatMap(({config}) => {
      const STORE = new Map<string, Root.Source>();

      const sources = [
        ...config.modal.map((src) => Root.make(Root.MODAL, src)),
        ...config.public.map((src) => Root.make(Root.PUBLIC, src)),
        ...config.ephemeral.map((src) => Root.make(Root.EPHEMERAL, src)),
      ];

      for (const src of sources) {
        if (STORE.has(src.id)) {
          return E.die(
            new RegistryDefect({
              why: `Duplicate Source: ${src.id}`,
            }),
          );
        }
        STORE.set(src.id, src);
      }

      const version = config.version
        ? `${config.version}`
        : Hash.array(Arr.map(sources, (src) => src.id));

      const checkout = (key: RegistryKey, props: any) => {
        const id = resolveId(key);
        const src = STORE.get(id);

        if (!src) {
          return E.fail(
            new RegistryDefect({
              why: `Unregistered Source: ${key}`,
            }),
          );
        }

        return E.succeed(Root.fromSource(src, props));
      };

      const fromHydrant = (hydrant: Fibril.Hydrant) => {
        const src = STORE.get(hydrant.id);

        if (!src) {
          return E.fail(
            new RegistryDefect({
              message: `Unregistered Source: ${hydrant.id}`,
            }),
          );
        }

        return E.succeed(Root.fromSourceHydrant(src, hydrant));
      };

      const register = (kind: Root.Type, ...src: (FC | Elem.Task)[]) => {
        for (const s of src) {
          const root = Root.make(kind, s);
          STORE.set(root.id, root);
        }
      };

      return E.succeed({
        fromHydrant,
        checkout,
        version,
        register,
      });
    }),
  ),
}) {}
