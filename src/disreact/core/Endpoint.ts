import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as FC from '#disreact/core/FC.ts';
import type * as Node from '#disreact/core/Node.ts';
import type * as Inspectable from 'effect/Inspectable';

export type Source = | FC.FC
                     | Node.Node;

export type Lookup = | string
                     | FC.FC
                     | Node.Node;

export interface Endpoint extends Inspectable.Inspectable {
  id  : string;
  node: Node.Node;
}

const Prototype = proto.type<Endpoint>({
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id : 'Endpoint',
      id  : this.id,
      node: this.node,
    });
  },
});

export const fromFC = (source: FC.FC): Endpoint => {

};

export const fromNode = (node: Node.Node): Endpoint => {

};
