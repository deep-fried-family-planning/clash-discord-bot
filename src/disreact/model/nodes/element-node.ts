/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */
import {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';



export class ElementNode extends DisReactAbstractNode {
  public clone(): ElementNode {
    const cloned = new ElementNode(this.type, this.props);
    return cloned;
  }
  public render(props: any): this {
    this.props = props;
    return this;
  }
}
