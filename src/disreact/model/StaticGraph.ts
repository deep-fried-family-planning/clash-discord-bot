/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {StaticGraphError} from '#src/disreact/codec/error.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import * as FC from '../codec/element/function-component.ts';
import type * as FiberHash from '../codec/fiber/fiber-hash.ts';
import * as RootElement from '../codec/fiber/root-element.ts';
import * as StaticRoot from '../codec/fiber/static-root.ts';


export type StaticGraphConfig = {
  ephemeral : FC.FC[];
  persistent: FC.FC[];
  dialog    : FC.FC[];
};

type StaticGraphMap = {[k: string]: StaticRoot.T};



const make = (config: StaticGraphConfig) => E.gen(function* () {
  const staticGraphMap = {} as StaticGraphMap;

  for (const ephemeral of config.ephemeral) {
    staticGraphMap[ephemeral.name] = StaticRoot.make(ephemeral);
  }

  for (const persistent of config.persistent) {
    staticGraphMap[persistent.name] = StaticRoot.make(persistent);
  }

  for (const dialog of config.dialog) {
    staticGraphMap[dialog.name] = StaticRoot.make(dialog);
  }

  // yield * E.addFinalizer(() => E.log('static graph: closed'));

  return {
    synthesizeClone: (
      root_id: FC.FC | string,
      props?: any,
    ) => {
      const name = typeof root_id === 'string' ? root_id : FC.resolveRootId(root_id);
      const root = staticGraphMap[name];

      if (!root) {
        throw new StaticGraphError({why: `${name} is not in the static graph`});
      }

      return RootElement.synthesizeFromStatic(root, props);
    },

    hydrateClone: (
      id: string,
      root_id: FC.FC | string,
      hash: FiberHash.T,
    ) => {
      const name = typeof root_id === 'string' ? root_id : FC.resolveRootId(root_id);
      const root = staticGraphMap[name];

      if (!root) {
        throw new StaticGraphError({why: `${name} is not in the static graph`});
      }

      return RootElement.hydrateFromStatic(id, root, hash);
    },

    makeClone: (
      id: string,
      root_id: FC.FC | string,
      props?: any,
    ) => E.gen(function* () {
      const name = typeof root_id === 'string' ? root_id : FC.resolveRootId(root_id);
      const root = staticGraphMap[name];

      if (!root) {
        return yield* new StaticGraphError({why: `${name} is not in the static graph`});
      }

      return RootElement.makeFromStatic(id, root, props);
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
    E.scoped,
  ));
}
