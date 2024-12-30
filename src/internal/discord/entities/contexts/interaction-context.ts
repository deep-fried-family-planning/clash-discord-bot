import type {IxIn} from '#discord/types.ts';
import {E, g, L} from '#pure/effect';


type IxCtx = {
  getIx: () => IxIn;
  setIx: (ix: IxIn) => void;

};


export class IxContext extends E.Tag('IxContext')<IxContext, IxCtx>() {
  static Live = L.effect(g(function * () {
    return {
      getIx: () => {},
      setIx: () => {},
    };
  }));
}
