import * as Elem from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

export class RehydratorError extends Data.TaggedError('RehydratorError')<{}> {}

export type RehydratorConfig = | Rehydrant.Registrant[]
                               | { [K in string]: Rehydrant.Registrant };

const getId = (input: string | Rehydrant.SourceId) => {
  if (typeof input === 'string') return input;
  if (FC.isFC(input)) return input[FC.NameId]!;
  if (Elem.isFn(input)) return input.type[FC.NameId]!;
};

const make = (config?: RehydratorConfig) => {
  const store = new Map<string, Rehydrant.Source>();

  if (config) {
    if (Array.isArray(config)) {
      for (const input of config) {
        const src = Rehydrant.source(input);
        store.set(src.id, src);
      }
    }
    if (typeof config === 'object') {
      for (const [id, input] of Object.entries(config)) {
        const src = Rehydrant.source(input, id);
        store.set(src.id, src);
      }
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

  const rehydrate = (hydrator: Rehydrant.Hydrator, data?: any) => E.suspend(() => {
    if (!store.has(hydrator.id)) {
      return new RehydratorError();
    }
    const source = store.get(hydrator.id)!;
    return E.succeed(Rehydrant.fromHydrator(source, hydrator, data));
  });

  return {
    register,
    checkout,
    rehydrate,
  };
};

export class Rehydrator extends E.Service<Rehydrator>()('disreact/Rehydrator', {
  succeed  : make(),
  accessors: true,
}) {
  static readonly config = (config?: RehydratorConfig) => L.succeed(this, this.make(make(config)));
}
