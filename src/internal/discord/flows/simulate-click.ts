import {Cx} from '#dfdis';
import type {CxPath} from '#discord/entities/cx-path.ts';
import type {SimulatedView} from '#discord/entities/view.ts';
import {CSL, E, g} from '#pure/effect';


// todo put rx here
export const simulateComponentClick = (view: SimulatedView, target: CxPath, rx?: any[][]) => g(function * () {
  const component = view.components.at(target.row)?.at(target.col);

  const output = component?.onClick?.(Cx.getSelectedOptions(rx?.at(target.row)?.at(target.col)) as never);

  if (E.isEffect(output)) {
    yield * output;
  }
}).pipe(
  E.catchAllDefect((e) => E.gen(function * () {
    yield * CSL.log('OnClick', e);
  })),
);


export const simulateDialogSubmit = (view: SimulatedView) => {
  view.dialog.onSubmit?.();
};


export const simulateDialogOpen = (view: SimulatedView) => {
  view.dialog.onOpen?.();
};
