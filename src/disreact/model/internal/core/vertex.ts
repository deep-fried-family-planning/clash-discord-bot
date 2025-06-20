import type * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import type * as Pipeable from 'effect/Pipeable';

const VertexId = Symbol.for('disreact/vertex');

export interface Vertex extends Pipeable.Pipeable,
  Lineage.Lineage,
  Lateral.Lateral
{
  [VertexId]: typeof VertexId;
  _tag      : any;
  $step?    : string;
  $trie?    : string;
  component?: any;
  coors     : number[];
  props?    : any;
  text?     : any;
  valence?  : Valence;
}

const ValenceId = Symbol.for('disreact/valence');

export interface Valence<A = any> extends Pipeable.Pipeable,
  Array<A>,
  Lineage.Lineage
{
  [ValenceId]: typeof ValenceId;
}
