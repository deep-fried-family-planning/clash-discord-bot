import type {Slice, VxTree} from '#dfdis';
import type {makeView} from '#discord/entities-basic/view.ts';
import {Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const make = <
  Scs extends ReturnType<typeof Slice.make>[],
  RootNode extends Extract<VxTree.T, {_tag: 'Root'}>,
>(
  config: {
    name  : str;
    // root      : RootNode;
    // routing_cx: CxVR.VirtualRouter;
    // routing_ex: ExVi.VirtualRouter;
    slices: Scs;
    views : ReturnType<typeof makeView>[];
  },
) => {
  const slices = p(
    config.slices,
    Kv.fromIterableWith((sc) => [sc.name, sc]),
  );

  const views = p(
    config.views,
    Kv.fromIterableWith((view) => [view.name, view]),
  );

  return {
    name: config.name,
    // root: config.name,
    // nodes     : VxTree.shallow(config.root),
    slices,
    views,
  };
};
