import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

type Node = | Text
            | List
            | Frag
            | Rest
            | Func;

interface Base extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage<Node>, Lateral.Lateral<Node> {
  document: any;
  polymer : any;
}

export interface Text extends Base {
  _tag     : 1;
  component: any;
}

export interface List extends Base {
  _tag: 2;
}

export interface Frag extends Base {
  _tag    : 3;
  children: Node[];
}

export interface Rest extends Base {
  _tag     : 4;
  component: string;
  props    : any;
  children : Node[];
}

export interface Func extends Base {
  _tag     : 5;
  component: string;
  props    : any;
  children : Node[];
}

const Prototype = proto.type<Node>({
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  _tag     : 'Intrinsic' as any,
  component: '',

  toJSON() {
    switch (this._tag) {
      case 'TextNode': {
        return Inspectable.format({
          _id : 'TextNode',
          text: this.component,
        });
      }
      case 'ListNode': {
        return Inspectable.format({
          _id: 'ListNode',
        });
      }
    }
  },
  toString() {
    return `<${this.component}>`;
  },
});

export const text = (text: string): Node => {};
