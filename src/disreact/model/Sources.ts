import {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {resolveId, Source} from '#src/disreact/model/meta/source.ts';
import {DisReactConfig} from '#src/disreact/model/DisReactConfig.ts';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Hash from 'effect/Hash';

const makeVersion = (store: Map<string, Source>, version?: string | number) =>
  version
    ? `${version}`
    : `${Hash.array([...store.values()].map((src) => String(src.elem)))}`;

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
        return yield* new SourcesError({cause: `Duplicate Source: ${source.id}`});
      }

      ctx.store.set(source.id, source);
    }
    ctx.version = makeVersion(ctx.store, ctx.version);

    return {
      version : ctx.version,
      register: (src: Source.Registrant, id?: string): Effect.Effect<Source, SourcesError> => {
        const source = Source.make(src, id);

        if (ctx.store.has(source.id)) {
          return new SourcesError({cause: `Duplicate Source: ${source.id}`});
        }

        ctx.store.set(source.id, source);
        ctx.version = makeVersion(ctx.store, ctx.version);

        return Effect.succeed(source);
      },
      checkout: (key: Source.Key, props?: any): Effect.Effect<Rehydrant, SourcesError> => {
        const id = resolveId(key);
        const src = ctx.store.get(id);

        return !src
          ? new SourcesError({cause: `Source Not Found: ${id}`})
          : Effect.succeed(Rehydrant.make(src, props));
      },
      rehydrate: (hydrator: Rehydrant.Decoded): Effect.Effect<Rehydrant, SourcesError> => {
        const src = ctx.store.get(hydrator.id);

        return !src
          ? new SourcesError({cause: `Source Not Found: ${hydrator.id}`})
          : Effect.succeed(Rehydrant.rehydrate(src, hydrator));
      },
    };
  }),
  dependencies: [],
  accessors   : true,
}) {}
