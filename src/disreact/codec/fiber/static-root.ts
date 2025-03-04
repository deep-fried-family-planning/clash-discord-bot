import * as FC from '#src/disreact/codec/element/function-component.ts';



export type T = {
  root_id  : string;
  component: FC.FC;
};

export const make = (component: FC.FC, root_id?: string): T => ({
  root_id: root_id ?? FC.resolveRootId(component),
  component,
});
