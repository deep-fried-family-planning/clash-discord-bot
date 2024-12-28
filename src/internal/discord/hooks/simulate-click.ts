import type {SimulatedView} from '#discord/entities/view.ts';
import type {CxPath} from '#discord/routing/cx-path.ts';


export const simulateComponentClick = (view: SimulatedView, target: CxPath) => {
  view.components.at(target.row)?.at(target.col)?.onClick?.();
};


export const simulateDialogSubmit = (view: SimulatedView) => {
  view.dialog.onSubmit?.();
};


export const simulateDialogOpen = (view: SimulatedView) => {
  view.dialog.onOpen?.();
};
