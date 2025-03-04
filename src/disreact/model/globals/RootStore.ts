import {E, L, pipe} from '#src/internal/pure/effect.ts';
import * as FC from 'src/disreact/codec/element/function-component.ts';
import type * as FiberHash from 'src/disreact/codec/fiber/fiber-hash.ts';
import * as RootElement from 'src/disreact/codec/fiber/root-element.ts';
import * as StaticRoot from 'src/disreact/codec/fiber/static-root.ts';



type RootId = string | FC.FC;

const resolveRootId = (root_id: RootId) => typeof root_id === 'string'
  ? root_id
  : FC.resolveRootId(root_id);

const roots = new Map<string, StaticRoot.T>();
const get   = (root_id: string) => roots.get(root_id);
const set   = (root: StaticRoot.T) => roots.set(root.root_id, root);

const map = new Map<string, StaticRoot.T>();

const getFromMap = (root_id: RootId) => {
  const name = resolveRootId(root_id);
  return map.get(name);
};



export type StaticGraphConfig = {
  ephemeral : FC.FC[];
  persistent: FC.FC[];
  dialog    : FC.FC[];
};

const make = (config: StaticGraphConfig) => E.gen(function* () {
  for (const ephemeral of config.ephemeral) {
    const root       = StaticRoot.make(ephemeral);
    root.isEphemeral = true;
    root.isMessage   = true;
    map.set(root.root_id, root);
  }

  for (const persistent of config.persistent) {
    const root     = StaticRoot.make(persistent);
    root.isMessage = true;
    map.set(root.root_id, root);
  }

  for (const dialog of config.dialog) {
    const root   = StaticRoot.make(dialog);
    root.isModal = true;
    map.set(root.root_id, root);
  }

  // yield * E.addFinalizer(() => E.log('static graph: closed'));

  return {
    synthesizeClone: (
      root_id: FC.FC | string,
      props?: any,
    ) => {
      const root = getFromMap(root_id)!;

      return RootElement.synthesizeFromStatic(root, props);
    },

    hydrateClone: (
      id: string,
      root_id: FC.FC | string,
      hash: FiberHash.T,
    ) => {
      const root = getFromMap(root_id)!;

      return RootElement.hydrateFromStatic(id, root, hash);
    },

    makeClone: (
      id: string,
      root_id: FC.FC | string,
      props?: any,
    ) => E.gen(function* () {
      const root = getFromMap(root_id)!;

      return RootElement.makeFromStatic(id, root, props);
    }),
  };
});



export class RootStore extends E.Tag('DisReact.StaticGraph')<
  RootStore,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly singleton = (config: StaticGraphConfig) => L.effect(this, pipe(
    make(config),
    E.cached,
    E.flatten,
    E.scoped,
  ));

  static readonly has = (root_id: FC.FC | string) => {
    const name = typeof root_id === 'string' ? root_id : FC.resolveRootId(root_id);
    return map.has(name);
  };
}
