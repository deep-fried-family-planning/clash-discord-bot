import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as Pipeable from 'effect/Pipeable';
import * as Inspectable from 'effect/Inspectable';

const Prototype = proto.type<Document.Document>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

export const make = () =>
  proto.init(Prototype, {

  });

export const flagNode = (self: Document.Document, node: Node.Node) => {
  self.flags.add(node);
};
