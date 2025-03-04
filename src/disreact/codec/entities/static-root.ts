import * as FC from 'src/disreact/codec/element/function-component.ts';



export type StaticRoot = {
  root_id  : string;
  component: FC.FC;
};

export const make = (component: FC.FC, root_id?: string): StaticRoot => ({
  root_id: root_id ?? FC.resolveName(component),
  component,
});
