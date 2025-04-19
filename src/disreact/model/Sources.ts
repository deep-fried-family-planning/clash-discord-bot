import {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {resolveId, Source} from '#src/disreact/model/meta/source.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {E, Hash, pipe} from '#src/disreact/utils/re-exports.ts';

const makeVersion = (store: Map<string, Source>, version?: string | number) =>
  version
    ? `${version}`
    : `${Hash.array([...store.values()].map((src) => src.id))}`;

const make = pipe(
  E.all({
    config: DisReactConfig,
  }),
  E.flatMap(({config}) => {
    const ctx = {
      version: config.version ?? '',
      store  : new Map<string, Source>(),
    };

    const register = (src: Source.Registrant, id?: string): E.Effect<Source, Error> => {
      const source = Source.make(src, id);

      if (ctx.store.has(source.id)) {
        return E.fail(new Error(`Duplicate Source: ${source.id}`));
      }

      ctx.store.set(source.id, source);
      ctx.version = makeVersion(ctx.store, ctx.version);

      return E.succeed(source);
    };

    for (const src of config.sources) {
      const source = Source.make(src);

      if (ctx.store.has(source.id)) {
        return E.fail(new Error(`Duplicate Source: ${source.id}`));
      }

      ctx.store.set(source.id, source);
    }

    ctx.version = makeVersion(ctx.store, ctx.version);

    const checkout = (key: Source.Key, props?: any): E.Effect<Rehydrant, Error> => {
      const id = resolveId(key);
      const src = ctx.store.get(id);

      if (!src) {
        return E.fail(new Error('Unknown Source Id'));
      }

      return E.succeed(Rehydrant.make(src, props));
    };

    const rehydrate = (hydrator: Rehydrant.Decoded): E.Effect<Rehydrant, Error> => {
      const src = ctx.store.get(hydrator.id);

      if (!src) {
        return E.fail(new Error('Unknown Source Id'));
      }

      return E.succeed(Rehydrant.rehydrate(src, hydrator));
    };

    return E.succeed({
      rehydrate,
      checkout,
      version: ctx.version,
      register,
    });
  }),
);

export class Sources extends E.Service<Sources>()('disreact/Registry', {
  accessors: true,
  effect   : make,
}) {}
