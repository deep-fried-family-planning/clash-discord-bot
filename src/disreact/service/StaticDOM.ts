import type {RenderFunction} from '#src/disreact/dsx/types.ts';
import {Critical} from '#src/disreact/internal/debug.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';

const make = (
  initialMessages: RenderFunction[] = [],
  initialModals: RenderFunction[] = [],
) => E.gen(function * () {
  const messages = {} as Record<string, RenderFunction>;
  const modals   = {} as Record<string, RenderFunction>;

  for (const dsx of initialMessages) {
    messages[dsx.name] = dsx;
  }
  for (const dsx of initialModals) {
    modals[dsx.name] = dsx;
  }

  return {
    addMessageRoot: (dsx: RenderFunction) => {
      if (dsx.name in messages) {
        return;
      }
      messages[dsx.name] = dsx;
    },
    addModalRoot: (dsx: RenderFunction) => {
      if (dsx.name in modals) {
        return;
      }
      modals[dsx.name] = dsx;
    },
    checkoutMessageRoot: (dsx: string | RenderFunction) => E.gen(function * () {
      const name = typeof dsx === 'string' ? dsx : dsx.name;

      if (name in messages) {
        return messages[name];
      }
      return yield * new Critical({why: `<${name}/> does not exist as a root message component`});
    }),
    checkoutModalRoot: (dsx: string | RenderFunction) => E.gen(function * () {
      const name = typeof dsx === 'string' ? dsx : dsx.name;

      if (name in messages) {
        return messages[name];
      }
      return yield * new Critical({why: `<${name}/> does not exist as a root message component`});
    }),
  };
});

export class StaticDOM extends E.Tag('DisReact.StaticDOM')<
  StaticDOM,
  EAR<typeof make>
>() {
  static makeLayer = (types: TagFunc[]) => L.effect(this, make(types));
}
