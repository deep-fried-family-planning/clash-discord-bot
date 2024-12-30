import {Cx, type Nx} from '#discord/entities/basic';
import type {RestDataComponent, RestDataResolved} from '#pure/dfx';
import {CSL, E, g, pipe} from '#pure/effect';
import type {nopt, str} from '#src/internal/pure/types-pure.ts';


export const simulateComponentClick = (
  view: Nx.T,
  rx_components: Cx.Grid,
  ix_data: RestDataComponent,
  target: Cx.Path,
) => {
  const view_component = view.components.at(target.row)!.at(target.col)!;
  const rest_component = rx_components.at(target.row)!.at(target.col)!;
  const selected       = (ix_data.values ?? []) as unknown as str[];

  const rest_updated = pipe(
    rest_component,
    Cx.setSelectedOptions(selected, ix_data.resolved as nopt<RestDataResolved>),
  );

  return g(function * () {
    const output = view_component.onClick?.({
      target  : rest_updated.data as never,
      selected: selected,
      values  : Cx.getSelectedOptions(rest_updated) as never,
      options : Cx.getOptions(rest_updated) as never,
    });

    if (E.isEffect(output)) {
      yield * output;
    }

    return rest_updated.data;
  }).pipe(
    E.catchAllDefect((e) => E.gen(function * () {
      yield * CSL.log('OnClick', e);
      return rest_updated.data;
    })),
  );
};


// export const simulateDialogSubmit = (view: Nx.T) => {
//   view.dialog.onSubmit?.();
// };


// export const simulateDialogOpen = (view: Nx.T) => {
//   view.dialog.onOpen?.();
// };
