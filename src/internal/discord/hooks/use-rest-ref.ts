import type {Cx} from '#discord/entities';
import {hooks} from '#discord/hooks/hooks.ts';
import {Arr, Kv, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type RxRef = str;


export const useRestRef = (id: str) => {
  const ref_id = `r_${id}`;

  hooks.refs.push(ref_id);

  return ref_id;
};


export const updateRxRefs = (vcs: Cx.Type[][], rcs: Cx.Type[][]) => {
  const rxRefs = pipe(
    rcs,
    Arr.flatten,
    Kv.fromIterableWith((cxrx) => [cxrx.route.accessor, cxrx]),
  );

  const flatVx = vcs.flat();

  return pipe(hooks.refs, Arr.reduce(vcs, (acc, ref_id) => {
    if (!(ref_id in rxRefs)) {
      return acc;
    }

    const rx = rxRefs[ref_id];
    const vx = flatVx.find((vx) => vx.route.accessor === ref_id);

    if (!vx) {
      return acc;
    }

    // @ts-expect-error tagged enums
    acc[vx.route.row][vx.route.col].data = rx.data;

    return acc;
  }));
};
