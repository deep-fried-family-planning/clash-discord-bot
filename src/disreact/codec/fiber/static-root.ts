import * as FC from '#src/disreact/codec/element/function-component.ts';



export type T = {
  root_id     : string;
  component   : FC.FC;
  isMessage?  : boolean;
  isModal?    : boolean;
  isEphemeral?: boolean;
};

export const make = (component: FC.FC, root_id?: string): T => {
  return {
    root_id: root_id ?? FC.resolveRootId(component),
    component,
  };
};
