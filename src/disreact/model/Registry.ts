import {FC} from '#src/disreact/model/entity/fc.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {Arr, Data, E, Hash, L, pipe} from '#src/disreact/utils/re-exports.ts';
import { Source } from './entity/source';



export declare namespace Registry {
  export type Key = string | FC | Elem;
}

const resolveId = (key: Registry.Key): string => {
  if (typeof key === 'string') {
    return key;
  }
  if (Elem.isRest(key)) {
    throw new Error();
  }
  if (Elem.isTask(key)) {
    return FC.getName(key.type);
  }
  return FC.getName(key);
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
    const STORE = new Map<string, Source>();

    for (const src of config.sources) {
      if (Elem.isPrim(src)) {
        return new RegistryDefect({why: `Primitive Source: ${String(src)}`});
      }

      if (Elem.isRest(src)) {
        return new RegistryDefect({why: `Rest Source: ${src.type}`});
      }

      const source = Source.make(src);

      // if (STORE.has(source.id)) {
      //   return new RegistryDefect({why: `Duplicate Source: ${source.id}`});
      // }

      STORE.set(source.id, source);
    }

    const version = config.version
      ? `${config.version}`
      : Hash.array(Arr.map([...STORE.values()], (src) => src.id));

    const checkout = (key: Registry.Key, props?: any) => {
      const id = resolveId(key);
      const src = STORE.get(id);

      if (!src) {
        return E.fail(new RegistryDefect({why: `Unregistered Source: ${key}`}));
      }

      return E.succeed(Rehydrant.make(src, props));
    };

    const rehydrate = (dehydrated: Rehydrant.Decoded) => {
      const src = STORE.get(dehydrated.id);

      if (!src) {
        return new RegistryDefect({why: `Unregistered Source: ${dehydrated.id}`});
      }

      return E.succeed(Rehydrant.rehydrate(src, dehydrated));
    };

    const register = (...src: (FC | Elem.Task)[]) => {
      for (const s of src) {
        const root = Source.make(s);
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

L.tap;
