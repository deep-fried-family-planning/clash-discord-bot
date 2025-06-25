import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import type * as Jsx from '#src/disreact/model/internal/core/jsx.ts';
import type * as Vertex from '#src/disreact/model/internal/node.ts';

export const TypeId = Symbol.for('disreact/source');

export interface Source extends Jsx.Prototype {
  [TypeId]: string;
};

export const isSource = (u: unknown): u is Source => typeof u === 'object' && u !== null && TypeId in u;

export type Registrant = | Jsx.Jsx
                         | FC.FC;

export const make = (r: Registrant, props?: any) => {

};

export type Lookup = | string
                     | Jsx.Jsx
                     | FC.FC;
