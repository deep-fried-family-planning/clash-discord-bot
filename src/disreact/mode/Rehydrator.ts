import * as El from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as JsxSchema from '#src/disreact/mode/schema/declarations-jsx.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';

const getId = (input: string | Rehydrant.SourceId) => {
  if (typeof input === 'string') return input;
  if (FC.isFC(input)) return input[FC.NameId]!;
  if (El.isComp(input)) return input.type[FC.NameId]!;
};

export class RehydratorError extends Data.TaggedError('RehydratorError')<{}> {}

export type RehydratorConfig = {
  primitive?    : string;
  normalization?: Record<string, string>;
  encoding?     : Record<string, (self: any, acc: any) => any>;
  sources?: | Rehydrant.Registrant[]
            | { [K in string]: Rehydrant.Registrant };
};

export class Rehydrator extends E.Service<Rehydrator>()('disreact/Rehydrator', {
  effect: (config?: RehydratorConfig) => E.gen(function* () {
    const store         = new Map<string, Rehydrant.Source>(),
          primitive     = config?.primitive ?? JsxSchema.primitive,
          normalization = config?.normalization ?? JsxSchema.normalization,
          encoding      = config?.encoding ?? JsxSchema.encoding,
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
          return yield* new RehydratorError();
        }
        store.set(src.id, src);
      }
    }

    const register = (input: Rehydrant.Registrant, id?: string) => E.suspend(() => {
      const src = Rehydrant.source(input, id);
      if (store.has(src.id)) {
        return new RehydratorError();
      }
      store.set(src.id, src);
      return E.void;
    });

    const checkout = (input: Rehydrant.SourceId, props: any, data?: any) => E.suspend(() => {
      const id = getId(input);
      if (!id) {
        return new RehydratorError();
      }
      if (!store.has(id)) {
        return new RehydratorError();
      }
      const source = store.get(id)!;
      return E.succeed(Rehydrant.fromSource(source, props, data));
    });

    const decode = (hydrator: Rehydrant.Hydrator, data?: any) => E.suspend(() => {
      if (!store.has(hydrator.id)) {
        return new RehydratorError();
      }
      const source = store.get(hydrator.id)!;
      return E.succeed(Rehydrant.fromHydrator(source, hydrator, data));
    });

    return {
      register,
      checkout,
      decode,
      primitive,
      normalization,
      encoding,
    };
  }),
  accessors: true,
}) {}
