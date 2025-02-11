import {dsx, dsxid} from '#src/disreact/internal/dsx/index.ts';
import type {Pragma, RenderFn} from '#src/disreact/internal/types.ts';
import {Critical} from '#src/disreact/internal/codec/debug.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';
import {pipe} from 'effect';
import console from 'node:console';
import {inspect} from 'node:util';



const make = (messageFns: RenderFn[] = [], modalFns: RenderFn[] = []) => E.gen(function * () {
  const messages = {} as Record<string, RenderFn>;
  const modals   = {} as Record<string, RenderFn>;

  for (const fn of messageFns) {
    messages[fn.name] = fn;
  }
  for (const fn of modalFns) {
    modals[fn.name] = fn;
  }

  return {
    addMessageRoot: (fn: RenderFn) => {
      if (fn.name in messages) {
        return;
      }
      messages[fn.name] = fn;
    },
    addModalRoot: (fn: RenderFn) => {
      if (fn.name in modals) {
        return;
      }
      modals[fn.name] = fn;
    },
    checkoutMessageRoot: (fn: string | RenderFn) => E.gen(function * () {
      const name = typeof fn === 'string' ? fn : fn.name;

      if (name in messages) {
        return messages[name];
      }
      return yield * new Critical({why: `<${name}/> does not exist as a root message component`});
    }),
    checkoutModalRoot: (fn: string | RenderFn) => E.gen(function * () {
      const name = typeof fn === 'string' ? fn : fn.name;

      if (name in messages) {
        return messages[name];
      }
      return yield * new Critical({why: `<${name}/> does not exist as a root message component`});
    }),
    checkoutRoot: (fn: string | RenderFn) => E.gen(function * () {
      const name = typeof fn === 'string' ? fn : fn.name;

      if (!(name in messages)) {
        return yield * new Critical({why: `<${name}/> does not exist as a root message component`});
      }

      const output = dsxid(dsx(messages[name], {}) as Pragma);

      console.log('checkoutRoot', inspect(output, false, null));

      return output;
    }),
  };
});



export class StaticDOM extends E.Tag('DisReact.StaticDOM')<
  StaticDOM,
  EAR<typeof make>
>() {
  static makeLayer = (
    messageFns: RenderFn[] = [],
    initialModals: RenderFn[] = [],
  ) => pipe(
    L.effect(StaticDOM, make(messageFns, initialModals)),
  );
}
