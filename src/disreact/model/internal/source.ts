import {IS_DEV} from '#src/disreact/model/internal/core/constants.ts';
import * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as FC from '#src/disreact/model/internal/core/fc.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as E from 'effect/Effect';

export const TypeId = Symbol.for('disreact/source');

export type Registrant = | Jsx.Jsx;

export type Lookup = | string
                     | Jsx.Jsx
                     | FC.FC;

export interface Source extends Jsx.Prototype {
  id: string;
};

export const isSource = (u: unknown): u is Source => typeof u === 'object' && u !== null && TypeId in u;

const Prototype = proto.declare<Source>({
  id: '',
});

export const make = (r: Jsx.Jsx): Source => {
  if (IS_DEV && isSource(r)) {
    throw new Error();
  }
  if (!r.props.source) {
    if (!Jsx.isFunctional(r)) {
      throw new Error();
    }
    const self = proto.init(Prototype, r);
    self.id = FC.name(r.component);
    return self;
  }
  if (typeof r.props.source !== 'string') {
    throw new Error();
  }
  const self = proto.init(Prototype, r.props.source);
  self.id = r.props.source.id;
  return self;
};

export const getLookup = (lookup: Lookup): string => {
  if (typeof lookup === 'string') {
    return lookup;
  }
  if (FC.isFC(lookup)) {
    if (!FC.isKnown(lookup)) {
      throw new Error();
    }
    return FC.name(lookup);
  }
  if (!('id' in lookup) || typeof lookup.id !== 'string') {
    throw new Error();
  }
  return lookup.id;
};
