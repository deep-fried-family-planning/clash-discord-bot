import * as All from '#src/disreact/codec/constants/all.ts';
import type * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import * as FiberState from '#src/disreact/codec/entities/fiber-state.ts';
import type * as TextElement from '#src/disreact/codec/element/text-element.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import type {E} from '#src/internal/pure/effect.ts';



export interface Component<P, R> {
  (props: P): R | Promise<R> | E.Effect<R, any>;
  displayName?: string;
  graphName?  : string;
  isRoot?     : boolean;
  isModal?    : boolean;
  isSync?     : boolean;
  isAsync?    : boolean;
  isEffect?   : boolean;
}

export type FEC<P = any, R = any> = Component<P, R>;



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
    isMounted?  : boolean | undefined;
    isModal?    : boolean | undefined;
    isRoot?     : boolean | undefined;
    isMessage?  : boolean | undefined;
    isEphemeral?: boolean | undefined;
  };
  props   : any;
  state   : FiberState.Type;
  render  : Component<any, JSX.Element>;
  children: (
    | Type
    | IntrinsicElement.Type
    | TextElement.Type
    )[];
};

export const is = (type: any): type is Type => type._tag === All.FunctionElementTag;

export const make = (type: Component<any, JSX.Element>, props: any): Type => {
  return {
    _kind   : getKind(type),
    _tag    : All.FunctionElementTag,
    _name   : getName(type),
    meta    : getMeta(type),
    props,
    state   : FiberState.make(),
    render  : type,
    children: [],
  };
};

export const dsxDEV_make = make;



const getName = (type: Component<any, JSX.Element>) => {
  if (type.displayName)
    return type.displayName;

  if (type.name)
    return type.name;

  return All.AnonymousName;
};

const getKind = (type: Component<any, JSX.Element>) => {
  if (type.isSync)
    return All.SyncFunctionTag;

  if (type.isEffect)
    return All.EffectFunctionTag;

  if (type.constructor.name === All.AsyncFunctionConstructorName)
    return All.AsyncFunctionTag;

  return All.SyncOrEffectFunctionTag;
};

const getMeta = (type: Component<any, JSX.Element>): Type['meta'] => {
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
