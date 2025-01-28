/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument */



import type {TagFunc} from '#src/disreact/model/dsx/types.ts';
import type {Switches} from '#src/disreact/model/hooks/danger.ts';
import {dismountNode, emptyHookState, type HookState, mountNode, releaseActiveRenderNode, setActiveRenderNode} from '#src/disreact/model/hooks/hook-state.ts';


export abstract class DisReactNode {
  public key           : string;
  public id            : string;
  public fullId        : string;
  public index         : number;
  public name          : string;
  public type          : string | TagFunc;
  public props         : any;
  public rootMapParent?: DisReactNode;
  public parent?       : DisReactNode;
  public nodes         : DisReactNode[];
  public switches      : Switches | undefined;
  public state         : HookState | undefined;

  public constructor(
    type: string | TagFunc,
    {children, ...props}: any,
  ) {
    this.name   = typeof type === 'string' ? type : type.name;
    this.type   = type;
    this.props  = props;
    this.nodes  = children ?? [];
    this.id     = this.name;
    this.fullId = '';
    this.index  = 0;
    this.key    = '';
  }

  public handleEvent(
    event: {
      type  : 'onClick' | 'onSubmit';
      target: any;
      values: string[];
    },
  ) {
    if (!(event.type in this.props)) return;

    setActiveRenderNode(this);

    this.props[event.type](event);
  }

  public setAbsoluteRoot(): void {
    this.id     = this.name;
    this.fullId = this.id;
  };

  public setRootMapParent(parent: DisReactNode): void {this.rootMapParent = parent};

  public setParent(parent: DisReactNode, index: number = 0): void {
    this.parent = parent;
    this.index  = index;
    this.id     = this.parent.id + '.' + this.name + ':' + `${this.index}`;
    this.fullId = this.parent.fullId + '.' + this.name + ':' + `${this.index}`;
  };

  public setProps(props: any): void {this.props = props}
  public setProp(key: string, value: any): void {this.props[key] = value}
  public abstract clone(): DisReactNode;
  public mount(): HookState | undefined {return undefined}
  public abstract render(props: any): DisReactNode;
  public dismount(): HookState | undefined {return this.state};
}

export class ElementNode extends DisReactNode {
  public clone(): ElementNode {return new ElementNode(this.type, this.props)}
  public render(props: any): this {
    this.props = props;
    return this;
  }
}

export class FunctionNode extends DisReactNode {
  public state: HookState;

  constructor(type: string | TagFunc, props: any) {
    super(type, props);
    this.state    = emptyHookState();
    this.state.id = this.name;
  }

  public clone(): FunctionNode {return new FunctionNode(this.type, this.props)}
  public mount(): HookState {return mountNode(this)}

  public render(props: any): this {
    setActiveRenderNode(this);

    const rendered = (this.type as TagFunc)(props);

    releaseActiveRenderNode();

    this.nodes = Array.isArray(rendered) ? rendered : [rendered];

    return this;
  }

  public dismount(): HookState {return this.state = dismountNode(this)!}
}



export const areNodesEqual = (nodeA: DisReactNode, nodeB: DisReactNode): boolean => {
  if (nodeA === nodeB) return true;
  if (nodeA.key !== nodeB.key) return false;
  if (nodeA.type !== nodeB.type) return false;
  return arePropsShallowEqual(nodeA.props, nodeB.props);
};

export const arePropsShallowEqual = (objA: any, objB: any): boolean => {
  if (objA === objB) return true;
  if (typeof objA !== typeof objB) return false;
  if (objA === null || objB === null) return false;
  if (typeof objA !== 'object' || typeof objB !== 'object') return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (key === 'children') continue;
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
};
