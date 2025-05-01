import {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {resolveId, Source} from '#src/disreact/model/meta/source.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {Data, Effect, Hash} from 'effect';

const makeVersion = (store: Map<string, Source>, version?: string | number) =>
  version
    ? `${version}`
    : `${Hash.array([...store.values()].map((src) => String(src.elem)))}`;

export class SourcesDefect extends Data.TaggedError('SourcesDefect')<{
  cause?: any;
}> {}

export class SourcesError extends Data.TaggedError('SourcesError')<{
  cause?: any;
}> {}

export class Sources extends Effect.Service<Sources>()('disreact/Sources', {
  effect: Effect.gen(function* () {
    const config = yield* DisReactConfig;

    const ctx = {
      version: config.version ?? '',
      store  : new Map<string, Source>(),
    };

    for (const src of config.sources) {
      const source = Source.make(src);

      if (ctx.store.has(source.id)) {
        return yield* Effect.die(new Error(`Duplicate Source: ${source.id}`));
      }

      ctx.store.set(source.id, source);
    }
    ctx.version = makeVersion(ctx.store, ctx.version);

    return {
      version : ctx.version,
      register: (src: Source.Registrant, id?: string): Effect.Effect<Source, Error> => {
        const source = Source.make(src, id);

        if (ctx.store.has(source.id)) {
          return Effect.fail(new Error(`Duplicate Source: ${source.id}`));
        }

        ctx.store.set(source.id, source);
        ctx.version = makeVersion(ctx.store, ctx.version);

        return Effect.succeed(source);
      },
      checkout: (key: Source.Key, props?: any): Effect.Effect<Rehydrant, Error> => {
        const id = resolveId(key);
        const src = ctx.store.get(id);

        return !src
          ? Effect.fail(new Error())
          : Effect.succeed(Rehydrant.make(src, props));
      },
      rehydrate: (hydrator: Rehydrant.Decoded): Effect.Effect<Rehydrant, Error> => {
        const src = ctx.store.get(hydrator.id);

        return !src
          ? Effect.fail(new Error())
          : Effect.succeed(Rehydrant.rehydrate(src, hydrator));
      },
    };
  }),
  dependencies: [],
  accessors   : true,
}) {}
