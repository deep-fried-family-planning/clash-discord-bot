import {Cx} from '#dfdis';
import type {CxPath} from '#discord/entities/cx-path.ts';
import type {SimulatedView} from '#discord/entities/view.ts';
import {E, g} from '#pure/effect';


export const simulateComponentClick = (view: SimulatedView, target: CxPath) => g(function * () {
  const component = view.components.at(target.row)?.at(target.col);

  const output = component?.onClick?.(Cx.getSelectedOptions(component) as never);

  if (E.isEffect(output)) {
    yield * output;
  }
});


export const simulateDialogSubmit = (view: SimulatedView) => {
  view.dialog.onSubmit?.();
};


export const simulateDialogOpen = (view: SimulatedView) => {
  view.dialog.onOpen?.();
};
