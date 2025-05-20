import type * as Event from '#src/disreact/mode/entity/event.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Props from '#src/disreact/mode/entity/props.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';

export declare namespace Elem {
  export type Val = {
    type : false;
    props: any;
    nodes: Any[];
  };
  export type Api = {
    id?     : string;
    type    : string;
    props   : Props.Props;
    nodes   : Any[];
    handler?: Event.Handler | undefined;
  };
  export type Fn = {
    id?  : string;
    type : FC.FC.Any<any, any>;
    props: Props.Props;
    nodes: Any[];
  };
  export type Node = Api | Fn;
  export type Any = Val | Node;
  export type Children = Any | Children[];
  export type Elem = Any;
}
export type Elem = Elem.Any;
export type Val = Elem.Val;
export type Api = Elem.Api;
export type Fn = Elem.Fn;
export type Node = Elem.Node;
export type Any = Elem.Any;
export type Children = Elem.Children;

const emptyNodes = () => Data.array([] as Elem.Any[]) as Elem.Any[];

export const ensureChildren = (cs?: Elem.Any | Elem.Any[]): Elem.Any[] => {
  if (!cs) return emptyNodes();
  if (Array.isArray(cs)) return Data.array(cs.flat()) as Elem.Any[];
  return Data.array([cs]) as Elem.Any[];
};

export const isVal = (e: Elem.Any): e is Elem.Val => !e.type;
export const isApi = (e: Elem.Any): e is Elem.Api => typeof e.type === 'string';
export const isFn = (e: Elem.Any): e is Elem.Fn => FC.isFC(e.type);

export const val = (value: any): Elem.Val => {
  return Data.struct({
    type : false,
    props: value,
    nodes: emptyNodes(),
  });
};

export const api = (tag: string, props: Props.Props): Elem.Api => {
  const handler = Props.extractHandler(props);
  return Data.struct({
    type : tag,
    props: Props.make(props),
    nodes: ensureChildren(props.children),
    handler,
  });
};

export const fn = (tag: any, props: Props.Props): Elem.Fn => {
  return Data.struct({
    type : FC.make(tag),
    props: Props.make(props),
    nodes: emptyNodes(),
  });
};
