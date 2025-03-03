import * as Component from '#src/disreact/codec/component/function.ts';



export type T = {
  root_id      : string;
  component    : Component.PFC;
  isEntrypoint?: boolean;
  isDialog?    : boolean;
  isEphemeral? : boolean;
};

export const make = (component: Component.PFC): T => {
  return {
    root_id: Component.resolveRootId(component),
    component,
  };
};
