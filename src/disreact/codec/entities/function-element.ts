import * as All from '#src/disreact/codec/constants/all.ts';
import type * as Element from '#src/disreact/codec/entities/element.ts';
import type * as FunctionComponent from '#src/disreact/codec/entities/function-component.ts';
import type * as IntrinsicElement from '#src/disreact/codec/entities/intrinsic-element.ts';
import * as NodeState from '#src/disreact/codec/entities/node-state.ts';
import type * as TextElement from '#src/disreact/codec/entities/text-element.ts';



export type Type = {
  _kind: ReturnType<typeof getKind>;
  _tag : typeof All.FunctionElementTag;
  _name: string;
  meta: {
    idx         : number;
    id          : string;
    step_id     : string;
    full_id     : string;
    graph_id?   : string;
    isModal?    : boolean | undefined;
    isRoot?     : boolean | undefined;
    isMessage?  : boolean | undefined;
    isEphemeral?: boolean | undefined;
  };
  props   : any;
  state   : NodeState.Type;
  render  : FunctionComponent.Type;
  children: (
    | Type
    | IntrinsicElement.Type
    | TextElement.Type
    )[];
};

export const is = (type: any): type is Type => type._tag === All.FunctionElementTag;

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
  if (type.displayName)
    return type.displayName;

  if (type.name)
    return type.name;

  return All.AnonymousName;
};



const getKind = (type: FunctionComponent.Type) => {
  if (type.isSync)
    return All.SyncFunctionTag;

  if (type.isEffect)
    return All.EffectFunctionTag;

  if (type.constructor.name === All.AsyncFunctionConstructorName)
    return All.AsyncFunctionTag;

  return All.SyncOrEffectFunctionTag;
};



const getMeta = (type: FunctionComponent.Type): Type['meta'] => {
  return {
    idx     : All.Zero,
    id      : All.Empty,
    step_id : All.Empty,
    full_id : All.Empty,
    isModal : type.isModal,
    isRoot  : type.isRoot,
    graph_id: All.Empty,
  };
};



export const dsxDEV_make = make;
