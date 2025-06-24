import type { INTRINSIC} from '#src/disreact/model/internal/core/constants.ts';
import type { PRIMITIVE, FUNCTION} from '#src/disreact/model/internal/core/constants.ts';
import type * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import type * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import type * as Pipeable from 'effect/Pipeable';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';

const Id = Symbol.for('disreact/node');

export interface Base extends Pipeable.Pipeable,
  Lineage.Lineage,
  Lateral.Lateral
{
  [Id]    : typeof Id;
  _tag    : typeof PRIMITIVE | typeof INTRINSIC | typeof FUNCTION;
  valence?: Node[];
}

export interface Text extends Base {
  _tag     : typeof PRIMITIVE;
  component: null | undefined | boolean | number | string;
}

export interface Rest extends Base {
  _tag     : typeof INTRINSIC;
  component: string;
}

export interface Func extends Base {
  _tag     : typeof FUNCTION;
  component: FC.Known;
  polymer? : Polymer.Polymer;
  document?: Document.Document<Node>;
}

export type Node = | Text
                   | Rest
                   | Func;
