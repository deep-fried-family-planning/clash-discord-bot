import type * as Elem from '#src/disreact/mode/entity/elem.ts';

export declare namespace Rehydrant {
  export type Hydrator = {
    id    : string;
    props : any;
    stacks: any;
  };
  export type Rehydrant = {
    id  : string;
    elem: Elem.Fn;
  };
}
export type Rehydrant = Rehydrant.Rehydrant;
export type Hydrator = Rehydrant.Hydrator;
