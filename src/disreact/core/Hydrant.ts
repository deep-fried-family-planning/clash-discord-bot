import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as FC from '#src/disreact/core/FC.ts';
import type * as Node from '#src/disreact/core/Node.ts';
import type * as Polymer from '#src/disreact/core/Polymer.ts';
import * as fc from '#src/disreact/core/primitives/fc.ts';
import * as node from '#src/disreact/core/primitives/node.ts';
import * as Inspectable from 'effect/Inspectable';

export interface Hydrant extends Inspectable.Inspectable {
  _tag  : 'Hydrant';
  source: string;
  props : any;
  state : Record<string, Polymer.Encoded[]>;
};

const Prototype = proto.type<Hydrant>({
  _tag: 'Hydrant',
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Hydrant',
      source: this.source,
      props : this.props,
      state : this.state,
    });
  },
});

export interface Endpoint extends Inspectable.Inspectable {
  _tag  : 'Endpoint';
  id    : string;
  source: Node.Node;
};

export const isEndpoint = (u: unknown): u is Endpoint => (u as any)._tag;

const Endpoint = proto.type<Endpoint>({
  _tag: 'Endpoint',
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Endpoint',
      id    : this.id,
      source: this.source,
    });
  },
});

export const endpoint = (type: FC.FC | Node.Node, id?: string): Endpoint => {
  if (typeof type === 'function') {
    const source = node.func(type, {});

    if (fc.isAnonymous(type)) {
      throw new Error();
    }

    return proto.init(Endpoint, {
      id    : id ?? fc.name(type),
      source: source,
    });
  }
  return proto.init(Endpoint, {
    id    : id ?? type.source,
    source: type,
  });
};

export type Lookup = | string
                     | FC.FC
                     | Node.Node
                     | Endpoint;

export const lookup = (type: Lookup): string | undefined => {
  switch (typeof type) {
    case 'string': {
      return type;
    }
    case 'function': {
      return fc.name(type);
    }
    case 'object': {
      if (isEndpoint(type)) {
        return type.id;
      }
      return type.source;
    }
  }
};
