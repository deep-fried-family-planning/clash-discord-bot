import  * as Elem from '#src/disreact/mode/entity/elem.ts';
import  * as FC from '#src/disreact/mode/entity/fc.ts';
import * as E from 'effect/Effect';
import * as Data from 'effect/Data';
import * as L from 'effect/Layer';

export class RehydratorError extends Data.TaggedError('RehydratorError')<{}> {}

export declare namespace Rehydrator {
  export type Input = FC.FC | Elem.Elem;

  export type Config =
    | Input[]
    | {[K in string]: Input};

  export type Source = {
    id  : string;
    elem: Elem.Fn;
  };
}

const source = (input: Rehydrator.Input, id?: string): Rehydrator.Source => {
  if (FC.isFC(input)) {
    const fn = Elem.fn(input, {});
    if (id) {
      fn.type[FC.NameId] = id;
    }
    return {
      id  : fn.type[FC.NameId]!,
      elem: fn,
    };
  }
  if (Elem.isFn(input)) {
    if (id) {
      input.type[FC.NameId] = id;
    }
    return {
      id  : input.type[FC.NameId]!,
      elem: input,
    };
  }
  throw new RehydratorError();
};

const getId = (input: Rehydrator.Input | string) => {
  if (typeof input === 'string') {
    return input;
  }
  if (FC.isFC(input)) {
    return input[FC.NameId]!;
  }
  if (Elem.isFn(input)) {
    return input.type[FC.NameId]!;
  }
};

const make = (config?: Rehydrator.Config) => {
  const store = new Map<string, Rehydrator.Source>();

  if (config) {
    if (Array.isArray(config)) {
      for (const input of config) {
        const src = source(input);
        store.set(src.id, src);
      }
    }
    if (typeof config === 'object') {
      for (const [id, input] of Object.entries(config)) {
        const src = source(input, id);
        store.set(src.id, src);
      }
    }
  }

  const register = (input: Rehydrator.Input, id?: string) => E.suspend(() => {
    const src = source(input, id);
    if (store.has(src.id)) {
      return new RehydratorError();
    }
    store.set(src.id, src);
    return E.void;
  });

  const checkout = (input: string | Rehydrator.Input, data?: any) => E.suspend(() => {
    const id = getId(input);
    if (!id) {
      return new RehydratorError();
    }
    if (!store.has(id)) {
      return new RehydratorError();
    }
    return E.succeed(store.get(id)!);
  });

  return {
    register,
    checkout,
  };
};

export class Rehydrator extends E.Service<Rehydrator>()('disreact/Rehydrator', {
  succeed  : make(),
  accessors: true,
}) {
  static readonly config = (config: Rehydrator.Config) =>
    L.succeed(
      Rehydrator,
      Rehydrator.make(make(config)),
    );
}
