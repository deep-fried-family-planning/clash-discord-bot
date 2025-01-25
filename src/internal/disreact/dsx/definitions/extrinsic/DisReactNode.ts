

export class DisReactNode {
  private props: any;
  private nodes: DisReactNode[];

  constructor(type, props) {
    this.nodes = [];
    this.props = props;
  }
}
