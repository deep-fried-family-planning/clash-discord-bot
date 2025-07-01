import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as FC from '#disreact/core/FC.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as fc from '#disreact/core/internal/fc.ts';
import * as node from '#disreact/core/internal/node.ts';
import * as Inspectable from 'effect/Inspectable';
import type * as Monomer from '#disreact/core/Monomer.ts';

export interface Hydrant extends Inspectable.Inspectable {
  _tag    : 'Hydrant';
  endpoint: string;
  props   : any;
  state   : Record<string, Monomer.Encoded[]>;
  data?   : any;
};

const Prototype = proto.type<Hydrant>({
  _tag: 'Hydrant',
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Hydrant',
      source: this.endpoint,
      props : this.props,
      state : this.state,
    });
  },
});

export const empty = (source: string, props: any): Hydrant => {
  return proto.init(Prototype, {
    endpoint: source,
    props   : props,
    state   : {},
  });
};

export const hasEncodings = (self: Hydrant) => Object.keys(self.state).length > 0;

export const addEncoding = (self: Hydrant, id: string, encoded: Monomer.Encoded[]): Hydrant => {
  if (id in self.state) {
    throw new Error();
  }
  self.state[id] = encoded;
  return self;
};

export const getEncoding = (self: Hydrant, id: string): Monomer.Encoded[] | undefined => {
  if (id in self.state) {
    const encoded = self.state[id];
    delete self.state[id];
    return encoded;
  }
  return undefined;
};

export const clearEncoding = (self: Hydrant) => {
  self.state = {};
};


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
  // todo clone
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
    id    : id ?? type.source!,
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
