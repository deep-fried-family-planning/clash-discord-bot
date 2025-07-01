import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as FC from '#src/disreact/core/FC.ts';
import {ANONYMOUS, ASYNC, type FCExecution, INTERNAL_ERROR} from '#src/disreact/core/primitives/constants.ts';
import * as Inspectable from 'effect/Inspectable';

export const isFC = (u: unknown): u is FC.FC => typeof u === 'function';

export const isKnown = (u: FC.FC): u is FC.Known => !!(u as any)._tag;

const Prototype = proto.type<FC.Known>({
  _id      : ANONYMOUS,
  stateless: false,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id      : 'FunctionComponent',
      name     : this._id,
      stateless: this.stateless,
      cast     : this._tag,
    });
  },
});

export const isCasted = (self: FC.FC): self is FC.Known => !!(self as FC.Known)._tag;

export const register = (fn: FC.FC): FC.Known => {
  if (isKnown(fn)) {
    return fn;
  }
  const fc = proto.impure(Prototype, fn);

  if (fn.length === 0) {
    fc.stateless = true;
  }

  fc._id = fc.displayName ? fc.displayName :
           fc.name ? fc.name :
           ANONYMOUS;

  return proto.isAsync(fc)
         ? cast(fc, ASYNC)
         : fc;
};

export const endpoint = <P>(id: string, self: FC.FC<P>): FC.Known<P> => {
  return self as any; // todo
};

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

export const kind = (fc: FC.FC): number | undefined => (fc as FC.Known)._tag;
