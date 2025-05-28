import * as El from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as JsxSchema from '#src/disreact/mode/jsx-schema.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Stack from 'effect/MutableList';

const getId = (input: string | Rehydrant.SourceId) => {
  if (typeof input === 'string') return input;
  if (FC.isFC(input)) return input[FC.NameId]!;
  if (El.isComponent(input)) return input.type[FC.NameId]!;
};

export class RehydratorError extends Data.TaggedError('RehydratorError')<{}> {}

export type RehydratorConfig = {
  sources?: | Rehydrant.Registrant[]
            | { [K in string]: Rehydrant.Registrant };

  primitive?    : string;
  normalization?: Record<string, string>;
  encoding?     : Record<string, (self: any, acc: any) => any>;
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

    const encode = (root: Rehydrant.Rehydrant | null) => {
      if (!root || El.isText(root.elem)) {
        return null;
      }

      const result = {} as any,
            stack  = Stack.make<[any, El.El[]]>([result, [root.elem]]),
            args   = new WeakMap<El.Nd, any>();

      while (Stack.tail(stack)) {
        const [acc, cs] = Stack.pop(stack)!;
        for (let i = 0; i < cs.length; i++) {
          const c = cs[i];

          if (El.isText(c)) {
            acc[primitive] ??= [];
            acc[primitive].push(c);
          }
          else if (args.has(c) && El.isRest(c)) {
            const norm = normalization[c.type];
            const arg = args.get(c)!;
            acc[norm] ??= [];
            acc[norm].push((encoding[c.type](c, arg)));
          }
          else if (!c.nodes.length && El.isRest(c)) {
            const norm = normalization[c.type];
            const arg = {};
            args.set(c, arg);
            acc[norm] ??= [];
            acc[norm].push((encoding[c.type](c, arg)));
          }
          else {
            Stack.append(stack, [acc, cs.slice(i)]);
            const arg = {};
            args.set(c, arg);
            const next = El.isRest(c) ? arg : acc;
            Stack.append(stack, [next, c.nodes]);
            break;
          }
        }
      }
      for (const key of Object.keys(result)) {
        if (result[key]) {
          return {
            _tag    : key,
            hydrator: Rehydrant.hydrator(root),
            data    : result[key][0],
          };
        }
      }
      return null;
    };

    return {
      register,
      checkout,
      decode,
      encode,
    };
  }),
  accessors: true,
}) {}
