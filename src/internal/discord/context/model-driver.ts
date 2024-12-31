import type {makeSlice} from '#discord/context/slice.ts';
import {Cx, Nv} from '#discord/entities';
import {Kv, p, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type Driver = ReturnType<typeof makeDriver>;


export const makeDriver = <
  Scs extends ReturnType<typeof makeSlice>[],
>(
  config: {
    name  : str;
    slices: Scs;
    views : Nv.T[];
  },
) => {
  const slices = p(
    config.slices,
    Kv.fromIterableWith((sc) => [sc.name, sc]),
  );

  const views = p(
    config.views,
    Kv.fromIterableWith((view) => [view.name, pipe(view, Nv.set('path', pipe(Cx.Path.empty(), Cx.Path.set('root', config.name))))]),
  );

  return {
    name: config.name,
    slices,
    views,
  };
};
