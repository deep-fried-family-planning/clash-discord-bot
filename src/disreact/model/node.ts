/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */



import type {TagFunc} from '#src/disreact/model/types.ts';
import type {Switches} from '#src/disreact/model/danger.ts';
import {dismountNode, emptyHookState, type HookState, mountNode, releaseActiveRenderNode, setActiveRenderNode} from '#src/disreact/model/hook-state.ts';
import {findNearestFunctionParent} from '#src/disreact/model/traversal.ts';
import console from 'node:console';



export abstract class DisReactNode {
  public index         : number;
  public id            : string;
  public relative_id   : string;
  public full_id       : string;
  public name          : string;
  public type          : string | TagFunc;
  public props         : any;
  public rootMapParent?: DisReactNode;
  public parent?       : DisReactNode;
  public nodes         : DisReactNode[];
  public switches      : Switches | undefined;
  public state         : HookState | undefined;
  public isRoot        : boolean = false;

  public constructor(type: string | TagFunc, {children, ...props}: any) {
    this.name        = typeof type === 'string' ? type : type.name;
    this.type        = type;
    this.props       = props;
    this.nodes       = children ?? [];
    this.index       = 0;
    this.id          = this.name;
    this.relative_id = '';
    this.full_id     = '';
  }

  public handleEvent(
    event: {
      type  : 'onClick' | 'onSubmit';
      target: any;
      values: any[];
    },
  ): DisReactNode {
    if (!(event.type in this.props)) {
      throw new Error('No handler for event: ' + event.type + ' in ' + this.name);
    }
    const functionNode = findNearestFunctionParent(this)!;
    console.log(functionNode.name);

    setActiveRenderNode(functionNode);

    this.props[event.type](event);

    return functionNode;
  }

  public setAbsoluteRoot(): void {
    this.id      = this.name;
    this.index   = 0;
    this.full_id = this.id;
    this.parent  = this;
    this.isRoot  = true;
    this.setParent(this);
  };

  public setRootMapParent(parent: DisReactNode): void {this.rootMapParent = parent};

  public setParent(parent: DisReactNode, index: number = 0): void {
    this.parent      = parent;
    this.index       = index;
    this.id          = `${this.name}:${this.index}`;
    this.relative_id = `${this.parent.id}:${this.id}`;
    this.full_id     = `${this.parent.full_id}:${this.id}`;
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
