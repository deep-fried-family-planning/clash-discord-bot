import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as Pipeable from 'effect/Pipeable';
import * as Inspectable from 'effect/Inspectable';

const Prototype = proto.type<Document.Document>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id : 'Document',
      body: this.body,
    });
  },
});

export const make = (root: Node.Node) =>
  proto.init(Prototype, {
    body : root,
    flags: new Set(),
  });

export const flagNode = (self: Document.Document, node: Node.Node) => {
  self.flags.add(node);
  return self;
};

export const getFlags = (self: Document.Document) => {
  const flags = [...self.flags];
  self.flags.clear();
  return flags;
};
