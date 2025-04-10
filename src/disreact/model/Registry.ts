import {FC} from '#src/disreact/model/entity/fc.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {Arr, Data, E, Hash, pipe} from '#src/disreact/utils/re-exports.ts';

export type RegistryKey = string | FC | Elem;

export declare namespace Registry {
  export type Key = RegistryKey;
}

const resolveId = (key: Registry.Key): string => {
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

const make = pipe(
  E.all({
    config: DisReactConfig,
  }),
  E.flatMap(({config}) => {
    const STORE = new Map<string, Rehydrant.Source>();

    for (const src of config.sources) {
      if (Elem.isPrim(src)) {
        return new RegistryDefect({why: `Primitive Source: ${String(src)}`});
      }

      if (Elem.isRest(src)) {
        return new RegistryDefect({why: `Rest Source: ${src.type}`});
      }

      const source = Rehydrant.source(src);

      // if (STORE.has(source.id)) {
      //   return new RegistryDefect({why: `Duplicate Source: ${source.id}`});
      // }

      STORE.set(source.id, source);
    }

    const version = config.version
      ? `${config.version}`
      : Hash.array(Arr.map([...STORE.values()], (src) => src.id));

    const checkout = (key: RegistryKey, props?: any) => {
      const id = resolveId(key);
      const src = STORE.get(id);

      if (!src) {
        return new RegistryDefect({why: `Unregistered Source: ${key}`});
      }

      return E.succeed(Rehydrant.make(src, props));
    };

    const rehydrate = (dehydrated: Rehydrant.Dehydrated) => {
      const src = STORE.get(dehydrated.id);

      if (!src) {
        return new RegistryDefect({why: `Unregistered Source: ${dehydrated.id}`});
      }

      return E.succeed(Rehydrant.rehydrate(src, dehydrated));
    };

    const register = (...src: (FC | Elem.Task)[]) => {
      for (const s of src) {
        const root = Rehydrant.source(s);
        STORE.set(root.id, root);
      }
      return E.void;
    };

    return E.succeed({
      rehydrate,
      checkout,
      version,
      register,
    });
  }),
);

export class Registry extends E.Service<Registry>()('disreact/Registry', {
  accessors: true,
  effect   : make,
}) {}
