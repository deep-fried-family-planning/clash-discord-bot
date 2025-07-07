import type * as FC from '#disreact/core/FC.ts';
import type * as Fn from '#disreact/core/Fn.ts';
import {ANONYMOUS, ASYNC, type FCExecution, INTERNAL_ERROR} from '#disreact/core/immutable/constants.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as Hash from 'effect/Hash';
import * as Equal from 'effect/Equal';

const FCPrototype = proto.type<FC.Known>({
  _id  : ANONYMOUS,
  state: true,
  props: true,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'FunctionComponent',
      name : this._id,
      state: this.state,
      props: this.props,
      cast : this._tag,
    });
  },
});

export const isFC = (u: unknown): u is FC.FC => typeof u === 'function';

export const register = (fn: FC.FC): FC.Known => {
  if (isKnown(fn)) {
    return fn;
  }

  const fc = proto.impure(FCPrototype, fn);

  if (fn.length === 0) {
    fc.props = false;
  }

  fc._id = fc.displayName ? fc.displayName :
           fc.name ? fc.name :
           ANONYMOUS;

  return proto.isAsync(fc)
         ? cast(fc, ASYNC)
         : fc;
};

export const isKnown = (u: FC.FC): u is FC.Known => !!(u as any)._tag;

export const isCasted = (self: FC.FC): self is FC.Known => !!(self as FC.Known)._tag;

export const cast = (self: FC.Known, type: FCExecution) => {
  if (isCasted(self)) {
    throw new Error(`Cannot recast function component: ${name(self)}`);
  }
  return Object.defineProperty(self, '_tag', {
    value       : type,
    writable    : false,
    configurable: false,
    enumerable  : true,
  });
};

export const isAnonymous = (self: FC.FC) => name(self) === ANONYMOUS;

export const overrideName = (self: FC.FC, name: string) => {
  (self as any)._id = name;
};

export const name = (maybe?: string | FC.FC) => {
  if (!maybe) {
    return ANONYMOUS;
  }
  if (!isFC(maybe)) {
    return maybe;
  }
  if (!isKnown(maybe)) {
    throw new Error(INTERNAL_ERROR);
  }
  return (maybe as any)._id as string;
};

const endpoints = globalValue(Symbol.for('disreact/endpoints'), () => new Map<string, FC.Known>());

export const endpoint = <P>(id: string, self: FC.FC<P>): FC.Known<P> => {
  if (endpoints.has(id)) {
    throw new Error(`Endpoint ${id} already exists`);
  }
  endpoints.set(id, self as any);
  return self as any;
};

const EventPrototype = proto.type<Fn.EventInternal>({
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id: 'Event',
    });
  },
  close() {
    this.compare!.endpoint = null;
  },
  openFC<P>(component: FC.FC<P>, props: P) {
    if (!props) {
      throw new Error();
    }
    this.compare!.endpoint = name(component);
    this.compare!.props = props;
  },
  open(node) {
    if (!node.src) {
      throw new Error();
    }
    this.compare!.endpoint = node.endpoint;
    this.compare!.props = node.props;
  },
});

export const event = (input: Fn.EventInput) =>
  proto.init(EventPrototype, {
    ...input,
    compare: {
      endpoint: input.endpoint,
      props   : {},
    },
  });

export const HandlerId = Symbol.for('disreact/handler');

const HandlerPrototype = proto.type<Fn.EventHandler>({
  [HandlerId]: HandlerId,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id: 'EventHandler',
    });
  },
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](that: Fn.EventHandler) {
    return that[HandlerId] === HandlerId;
  },
});

export const handler = (fn: Fn.Handler) => proto.init(HandlerPrototype, fn);
