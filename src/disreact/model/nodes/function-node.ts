/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */

import type {TagFunc} from '#disreact/dsx/types.ts';
import {dismountNode, emptyHookState, type HookState, mountNode, releaseActiveRenderNode, setActiveRenderNode} from '#disreact/model/hooks/hook-state.ts';
import {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';



export class FunctionNode extends DisReactAbstractNode {
  public state: HookState;

  constructor(type: string | TagFunc, props: any) {
    super(type, props);
    this.state    = emptyHookState();
    this.state.id = this.name;
  }

  public clone(): FunctionNode {
    const cloned = new FunctionNode(this.type, this.props);
    return cloned;
  }

  public mount() {
    mountNode(this);
  }

  public render(props: any) {
    setActiveRenderNode(this);

    const rendered = (this.type as TagFunc)(props);

    releaseActiveRenderNode();

    this.nodes = Array.isArray(rendered) ? rendered : [rendered];

    return this;
  }

  public dismount() {
    this.state = dismountNode(this)!;
    return this.state;
  }
}
