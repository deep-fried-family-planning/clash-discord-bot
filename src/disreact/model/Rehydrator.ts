import * as Element from '#src/disreact/model/internal/element.ts';
import * as Rehydrant from '#src/disreact/model/internal/rehydrant.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';

export class SourceDefect extends Data.TaggedError('SourceDefect')<{
  message?: string;
}> {}

export type RehydratorConfig = {
  sources?: | (Element.Element | Element.Fc)[]
            | { [K in string]: Element.Element | Element.Fc };
};

const getId = (input: Element.Element | Element.Fc | string) => {
  if (typeof input === 'string') {
    return input;
  }
  return Element.getSourceId(input);
};

export class Rehydrator extends E.Service<Rehydrator>()('disreact/Rehydrator', {
  effect: (config?: RehydratorConfig) => {
    const store   = new Map<string, Element.Source>(),
          sources = config?.sources ?? [];

    if (Array.isArray(sources)) {
      for (const input of sources) {
        const src = Element.registerSource(input);

        store.set(Element.getSourceId(src)!, src);
      }
    }
    else if (typeof sources === 'object') {
      for (const [, input] of Object.entries(sources)) {
        const src = Element.registerSource(input);
        const id = Element.getSourceId(src);

        if (store.has(id!)) {
          return new SourceDefect({
            message: `Source (${id}) already registered.`,
          });
        }

        store.set(id!, src);
      }
    }

    const register = (
      input: Element.Element | Element.Fc,
    ) => E.suspend(() => {
      const src = Element.registerSource(input);
      const id = Element.getSourceId(src);

      if (store.has(id!)) {
        return new SourceDefect({
          message: `Source (${id}) already registered.`,
        });
      }

      store.set(id!, src);
      return E.void;
    });

    const checkout = (
      input: Element.Element | Element.Fc | string,
      props: any,
      data?: any,
    ) => E.suspend(() => {
      const id = getId(input);
      if (!id) {
        return new SourceDefect({
          message: 'No source id.',
        });
      }
      if (!store.has(id)) {
        return new SourceDefect({
          message: `Source (${id}) is not registered.`,
        });
      }
      const src = store.get(id)!;
      return E.succeed(Rehydrant.fromSource(src, props, data));
    });

    const rehydrate = (
      hydrator: Rehydrant.Hydrator,
      data?: any,
    ) => E.suspend(() => {
      if (!store.has(hydrator.id)) {
        return new SourceDefect({
          message: `Source (${hydrator.id}) is not registered.`,
        });
      }
      const src = store.get(hydrator.id)!;
      const rh = Rehydrant.rehydrate(src, hydrator, data);
      return E.succeed(rh);
    });

    return E.succeed({
      register,
      checkout,
      rehydrate,
    });
  },
  accessors: true,
}) {}
