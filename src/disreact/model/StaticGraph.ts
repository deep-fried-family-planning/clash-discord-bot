import {dsx} from '#src/disreact/model/lifecycles/dsx-create.ts';
import type {Pragma, RenderFn} from '#src/disreact/model/lifecycle.ts';
import {StaticGraphError} from '#src/disreact/error.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import console from 'node:console';
import * as Lifecycles from './lifecycles/index.ts';



export type StaticGraphConfig = {
  ephemeral : RenderFn[];
  persistent: RenderFn[];
  dialog    : RenderFn[];
};



type StaticGraphNode = {
  isEphemeral : boolean;
  isPersistent: boolean;
  isDialog    : boolean;
  isEffect    : boolean;
  meta?: {
    isEphemeral : boolean;
    isPersistent: boolean;
    isDialog    : boolean;
    isEffect    : boolean;
  };
  render: RenderFn;
};



type StaticGraphMap = {[k: string]: StaticGraphNode};



const make = (config: StaticGraphConfig) => E.gen(function * () {
  const staticGraphMap = {} as StaticGraphMap;

  for (const ephemeral of config.ephemeral) {
    staticGraphMap[ephemeral.name] = {
      isEphemeral : true,
      isPersistent: false,
      isDialog    : false,
      isEffect    : false,
      render      : ephemeral,
    };
  }

  for (const persistent of config.persistent) {
    staticGraphMap[persistent.name] = {
      isEphemeral : false,
      isPersistent: true,
      isDialog    : false,
      isEffect    : false,
      render      : persistent,
    };
  }

  for (const dialog of config.dialog) {
    staticGraphMap[dialog.name] = {
      isEphemeral : false,
      isPersistent: false,
      isDialog    : true,
      isEffect    : false,
      render      : dialog,
    };
  }

  console.log(staticGraphMap);

  yield * E.addFinalizer(() => E.log('static graph: closed'));

  return {
    cloneRoot: (fn: RenderFn | string) => E.gen(function * () {
      const name = typeof fn === 'string' ? fn : fn.name;

      if (!(name in staticGraphMap)) {
        return yield * new StaticGraphError({why: `${name} is not in the static graph`});
      }

      return Lifecycles.linkNodeToParent(dsx(staticGraphMap[name].render) as Pragma);
    }),
  };
});



export class StaticGraph extends E.Tag('DisReact.StaticGraph')<
  StaticGraph,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly singleton = (config: StaticGraphConfig) => L.effect(this, pipe(
    make(config),
    E.cached,
    E.flatten,
  ));
}
