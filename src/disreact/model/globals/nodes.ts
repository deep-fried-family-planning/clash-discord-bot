import * as Roots from '#src/disreact/model/globals/roots.ts';



export const make = (id: string) => ({
  id,

  pc   : 0,
  stack: [] as any[],
  prior: [] as any[],

  rc   : 0,
  queue: [] as any[],

  circular: {
    node: null as any,
    refs: [] as any[],
  },
});

export type Type = ReturnType<typeof make>;



export const mount = (id: string) => {
  const node = make(id);

  Roots.current().state.set(id, node);

  return node;
};



export const dismount = (id: string) => {
  return Roots.current().state.delete(id);
};



export const current = (id: string) => {
  const state = Roots.current().state.get(id);

  if (!state) {
    throw new Error(`Internal: No node state found for id ${id}`);
  }

  return state;
};
