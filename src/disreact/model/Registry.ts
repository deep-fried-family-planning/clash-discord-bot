import {FC} from '#src/disreact/model/comp/fc.ts';
import type {Fibril} from '#src/disreact/model/comp/fibril.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Root} from '#src/disreact/model/entity/root.ts';
import {Arr, Data, E, Hash} from '#src/disreact/utils/re-exports.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';


export class SourceDefect extends Data.TaggedError('disreact/SourceDefect')<{
  message?: string;
  why?    : string;
  cause?  : Error;
}> {}

const STORE = new Map<string, Root.Source>();

const resolveId = (key: string | FC | Elem): string => {
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

export class Registry extends E.Service<Registry>()('disreact/Registry', {
  effect: E.map(DisReactConfig, (config) => {
    const sources = [
      ...config.modal.map((src) => Root.make(Root.MODAL, src)),
      ...config.public.map((src) => Root.make(Root.PUBLIC, src)),
      ...config.ephemeral.map((src) => Root.make(Root.EPHEMERAL, src)),
    ];

    for (const src of sources) {
      // if (ξ.has(src.id)) {
      //   return E.die(new SourceDefect({why: `Duplicate Source: ${src.id}`}));
      // }
      STORE.set(src.id, src);
    }

    const version = config.version
      ? `${config.version}`
      : Hash.array(Arr.map(sources, (src) => src.id));

    const checkout = (key: string | FC | Elem, props: any = {}): E.Effect<Root, SourceDefect> => {
      const id = resolveId(key);
      const src = STORE.get(id);

      if (!src) {
        return E.fail(new SourceDefect({message: `Unregistered Source: ${key}`}));
      }

      return E.succeed(Root.fromSource(src, props));
    };

    const fromHydrant = (hydrant: Fibril.Hydrant): E.Effect<Root, SourceDefect> => {
      const src = STORE.get(hydrant.id);

      if (!src) {
        return E.fail(new SourceDefect({message: `Unregistered Source: ${hydrant.id}`}));
      }

      return E.succeed(Root.fromSourceHydrant(src, hydrant));
    };

    const register = (kind: Root.Type, ...src: (FC | Elem.Task)[]) => {
      for (const s of src) {
        const root = Root.make(kind, s);
        STORE.set(root.id, root);
      }
    };

    const registerModal = (...src: (FC | Elem.Task)[]) => register(Root.MODAL, ...src);

    const registerEphemeral = (...src: (FC | Elem.Task)[]) => register(Root.EPHEMERAL, ...src);

    const registerPublic = (...src: (FC | Elem.Task)[]) => register(Root.PUBLIC, ...src);

    return {
      fromHydrant,
      checkout,
      version,
      register,
      registerModal,
      registerEphemeral,
      registerPublic,
    };
  }),
}) {}
