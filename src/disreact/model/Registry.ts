import {Elem} from '#src/disreact/model/elem/elem.ts';
import {FC} from '#src/disreact/model/meta/fc.ts';
import {Rehydrant} from '#src/disreact/model/schema/rehydrant.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {Arr, Data, E, Hash, pipe} from '#src/disreact/utils/re-exports.ts';

export declare namespace Registry {
  export type Key = string | FC | Elem;
}

export class RegistryDefect extends Data.TaggedError('disreact/RegistryException')<{
  message?: string;
  why?    : string;
  cause?  : Error;
}> {}

const resolveId = (key: Registry.Key): string => {
  if (typeof key === 'string') return key;
  if (FC.isFC(key)) return FC.getName(key);
  if (Elem.isRest(key)) throw new Error();
  if (Elem.isTask(key)) return FC.getName(key.type);
  throw new Error();
};

const make = pipe(
  E.all({
    config: DisReactConfig,
  }),
  E.flatMap(({config}) => {
    const STORE = new Map<string, Rehydrant.Source>();

    for (const src of config.sources) {
      if (Elem.isRest(src)) {
        return new RegistryDefect({why: `Rest Source: ${src.type}`});
      }

      const source = Rehydrant.makeSource(src);

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
        const root = Rehydrant.makeSource(s);
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
