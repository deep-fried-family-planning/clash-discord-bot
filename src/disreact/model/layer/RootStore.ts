import {Component} from '#src/disreact/codec/dsx/element/index.ts';
import {type FiberHash, TreeRoot, TreeSeed} from '#src/disreact/codec/dsx/fiber/index.ts';
import type {Element} from '#src/disreact/codec/dsx/index.ts';
import {dsx} from '#src/disreact/model/dsx/dsx.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {E, L} from '#src/internal/pure/effect.ts';



export type RootStoreConfig = {
  entrypoint?: Component.PFC[];
  ephemeral? : Component.PFC[];
  dialogs?   : Component.PFC[];
};

const make = (config?: RootStoreConfig) => E.gen(function* () {
  const roots = new Map<string, TreeSeed.T>();

  const makeOrThrow = (type: Component.PFC) => {
    const root = TreeSeed.make(type);

    if (roots.has(root.root_id)) {
      throw new Error(`Root with id ${root.root_id} already exists`);
    }

    roots.set(root.root_id, root);

    return root;
  };

  config?.entrypoint?.forEach((type) => {
    const root        = makeOrThrow(type);
    root.isEntrypoint = true;
  });

  config?.ephemeral?.forEach((type) => {
    const root       = makeOrThrow(type);
    root.isEphemeral = true;
  });

  config?.dialogs?.forEach((type) => {
    const root    = makeOrThrow(type);
    root.isDialog = true;
  });

  const registerRoot = (type: Component.PFC) => {
    makeOrThrow(type);
  };

  const registerRoots = (types: Component.PFC[]) => {
    types.forEach((type) => {makeOrThrow(type)});
  };

  const cloneRoot = (
    id: string,
    fn: string | Component.PFC,
    hash?: FiberHash.Encoded,
  ) => {
    const root_id = typeof fn === 'string'
      ? fn
      : Component.resolveRootId(fn);

    if (!roots.has(root_id)) {
      throw new Error(`Root with id ${root_id} does not exist`);
    }

    const root = roots.get(root_id)!;

    const initial = dsx(root.component);
    const element = Lifecycles.linkNodeToParent(initial as Element.Function.T);

    return TreeRoot.make(id, root_id, element, hash);
  };

  const updateRoot = (root_id: string, updates: Partial<TreeRoot.T>) => {
    if (!roots.has(root_id)) {
      throw new Error(`Root with id ${root_id} does not exist`);
    }
    const root = roots.get(root_id)!;

    for (const [key, value] of Object.entries(updates)) {
      root[key as keyof typeof root] = value;
    }
  };

  return {
    registerRoot,
    registerRoots,
    cloneRoot,
    updateRoot,
  };
});

export class RootStore extends E.Tag('DisReact.RootStore')<
  RootStore,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static readonly Default   = L.effect(this, make());
  static readonly singleton = (config: RootStoreConfig) => L.effect(this, make(config));
}
