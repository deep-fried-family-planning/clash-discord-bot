import * as El from '#src/disreact/model/entity/element.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as JsxDefault from '#src/disreact/codec/intrinsic/index.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import console from 'node:console';

const getId = (input: string | Rehydrant.SourceId) => {
  if (typeof input === 'string') return input;
  if (FC.isFC(input)) return FC.id(input);
  if (El.isComp(input)) return FC.id(input.type);
};

export class RehydratorError extends Data.TaggedError('RehydratorError')<{cause: Error}> {}

export type RehydratorConfig = {
  primitive?    : string;
  normalization?: Record<string, string>;
  encoding?     : Record<string, (self: any, acc: any) => any>;
  sources?: | Rehydrant.Registrant[]
            | { [K in string]: Rehydrant.Registrant };
};

export class Rehydrator extends E.Service<Rehydrator>()('disreact/Rehydrator', {
  effect: (config?: RehydratorConfig) => {
    const store         = new Map<string, Rehydrant.Source>(),
          primitive     = config?.primitive ?? JsxDefault.primitive,
          normalization = config?.normalization ?? JsxDefault.normalization as Record<string, string>,
          encoding      = config?.encoding ?? JsxDefault.encoding as Record<string, (self: any, acc: any) => any>,
          sources       = config?.sources ?? [];

    if (Array.isArray(sources)) {
      for (const input of sources) {
        const src = Rehydrant.source(input);
        store.set(src.id, src);
      }
    }
    else if (typeof sources === 'object') {
      for (const [id, input] of Object.entries(sources)) {
        const src = Rehydrant.source(input, id);
        if (store.has(src.id)) {
          return new RehydratorError({cause: new Error(`Source (${src.id}) already registered`)});
        }
        store.set(src.id, src);
      }
    }

    const register = (input: Rehydrant.Registrant, id?: string) => E.suspend(() => {
      const src = Rehydrant.source(input, id);
      if (store.has(src.id)) {
        return new RehydratorError({cause: new Error(`Source (${src.id}) already registered`)});
      }
      store.set(src.id, src);
      return E.void;
    });

    const checkout = (input: Rehydrant.SourceId, props: any, data?: any) => E.suspend(() => {
      const id = getId(input);
      if (!id) {
        return new RehydratorError({cause: new Error('No source id')});
      }
      if (!store.has(id)) {
        return new RehydratorError({cause: new Error(`Source (${id}) is not registered`)});
      }
      const source = store.get(id)!;
      return E.succeed(Rehydrant.fromSource(source, props, data));
    });

    const decode = (hydrator: Rehydrant.Hydrator, data?: any) => E.suspend(() => {
      if (!store.has(hydrator.id)) {
        return new RehydratorError({cause: new Error(`Source (${hydrator.id}) is not registered`)});
      }
      const source = store.get(hydrator.id)!;
      return E.succeed(Rehydrant.rehydrate(source, hydrator, data));
    });

    return E.succeed({
      register,
      checkout,
      decode,
      primitive,
      normalization,
      encoding,
    });
  },
  accessors: true,
}) {}
