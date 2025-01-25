/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
import type {TagFunc} from '#disreact/dsx/types.ts';
import {type HookState, setActiveRenderNode} from '#disreact/model/hooks/hook-state.ts';
import type {Switches} from '#disreact/model/static-graph/use-switch.ts';



export abstract class DisReactAbstractNode {
  public key           : string;
  public id            : string;
  public fullId        : string;
  public index         : number;
  public name          : string;
  public type          : string | TagFunc;
  public props         : any;
  public rootMapParent?: DisReactAbstractNode;
  public parent?       : DisReactAbstractNode;
  public nodes         : DisReactAbstractNode[];
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

  public freeze() {
    Object.freeze(this);
  }

  public handleEvent(
    event: {
      type: 'onClick' | 'onSubmit';
      rest: any;
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

  public setRootMapParent(parent: DisReactAbstractNode): void {
    this.rootMapParent = parent;
  };

  public setParent(parent: DisReactAbstractNode, index: number = 0): void {
    this.parent = parent;
    this.index  = index;
    this.id     = this.parent.id + '.' + this.name + ':' + `${this.index}`;
    this.fullId = this.parent.fullId + '.' + this.name + ':' + `${this.index}`;
  };

  public setProps(props: any): void {
    this.props = props;
  }

  public setProp(key: string, value: any): void {
    this.props[key] = value;
  }

  public abstract clone(): DisReactAbstractNode;

  public mount(): void {}

  public abstract render(props: any): DisReactAbstractNode;

  public dismount(): HookState | undefined {
    return this.state;
  };
}
