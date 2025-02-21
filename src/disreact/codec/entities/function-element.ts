import * as All from '../schema/common/all.ts';
import type * as Element from './element.ts';
import type * as FunctionComponent from './function-component.ts';
import * as NodeState from './node-state.ts';



export type Type = {
  _kind: string;
  _tag : typeof All.FunctionElementTag;
  _name: string;
  meta: {
    idx         : number;
    id          : string;
    step_id     : string;
    full_id     : string;
    isModal?    : boolean | undefined;
    isRoot?     : boolean | undefined;
    isMessage?  : boolean | undefined;
    isEphemeral?: boolean | undefined;
    graphName   : string;
  };
  props   : any;
  state   : NodeState.Type;
  render  : FunctionComponent.Type;
  children: Element.Type[];
};



export const make = (type: FunctionComponent.Type, props: any): Type => {
  return {
    _kind   : getKind(type),
    _tag    : All.FunctionElementTag,
    _name   : getName(type),
    meta    : getMeta(type),
    props,
    state   : NodeState.make(),
    render  : type,
    children: [] as Element.Type[],
  };
};



const getName = (type: FunctionComponent.Type) => {
  if (type.displayName) {
    return type.displayName;
  }

  if (type.name) {
    return type.name;
  }

  return All.NotSet;
};



const getKind = (type: FunctionComponent.Type) => {
  return type.isSync ? All.SyncFunctionTag
    : type.isEffect ? All.EffectFunctionTag
      : type.constructor.name === All.AsyncFunctionConstructorName ? All.AsyncFunctionTag
        : All.SyncOrEffectFunctionTag;
};



const getMeta = (type: FunctionComponent.Type) => {
  return {
    idx      : All.NotSetInt,
    id       : All.NotSet,
    step_id  : All.NotSet,
    full_id  : All.NotSet,
    isModal  : type.isModal,
    isRoot   : type.isRoot,
    graphName: All.NotSet,
  };
};
