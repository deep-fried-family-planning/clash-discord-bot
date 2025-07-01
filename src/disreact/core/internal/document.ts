import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

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

export const make = (input: Document.Input) =>
  proto.init(Prototype, {
    ...input,
    flags: new Set(),
  });

export const flagNode = (self: Document.Document, node: Node.Func) => {
  self.flags.add(node);
  return self;
};

export const getFlags = (self: Document.Document) => {
  const flags = [...self.flags];
  self.flags.clear();
  return flags;
};

export const hasEncodings = (self: Document.Document) => Object.keys(self.trie).length > 0;

export const getEncoding = (self: Document.Document, id: string) => {
  if (id in self.trie) {
    const encoded = self.trie[id];
    delete self.trie[id];
    return encoded;
  }
  return undefined;
};

export const addEncoding = (self: Document.Document, id: string, encoded: any) => {
  if (id in self.trie) {
    throw new Error();
  }
  self.trie[id] = encoded;
};
