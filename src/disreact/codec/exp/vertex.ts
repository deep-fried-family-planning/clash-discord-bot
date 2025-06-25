import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as FC from '#src/disreact/model/internal/core/fc.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type {PrimitiveValue} from '@effect/platform/Template';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import * as Pipeable from 'effect/Pipeable';

export const TypeId = Symbol.for('disreact/vertex'),
             PRAGMA = 0 as const,
             TEXT   = 1 as const,
             REST   = 2 as const,
             FUNC   = 3 as const;

export interface Base<A = Vertex> extends Pipeable.Pipeable,
  Lineage.Lineage<A>,
  Lateral.Lateral<A>,
  Hash.Hash,
  Equal.Equal
{
  [TypeId]  : typeof PRAGMA | typeof TypeId;
  _tag      : typeof REST | typeof FUNC | typeof TEXT;
  $step?    : string;
  $trie?    : string;
  component?: any;
  coors     : number[];
  props?    : Props;
  text?     : PrimitiveValue;
  valence?  : Valence<A>;
};

export interface Rest extends Base {
  _tag     : typeof REST;
  component: string;
}

export interface Func extends Base {
  _tag     : typeof FUNC;
  component: FC.Known;
}

export interface Text extends Base {
  _tag: typeof TEXT;
  text: PrimitiveValue;
}

export type Vertex = | Rest
                     | Func
                     | Text;

export type Pragma = | PrimitiveValue
                     | Exclude<Vertex, Text>;

export const isVertex = (u: unknown): u is Vertex => typeof u === 'object' && u !== null && TypeId in u && u[TypeId] === TypeId;

export const isPragma = (u: unknown): u is Vertex => typeof u === 'object' && u !== null && TypeId in u && u[TypeId] === PRAGMA;

export const isRest = (u: Vertex): u is Rest => u._tag === REST;

export const isFunc = (u: Vertex): u is Func => u._tag === FUNC;

export const isText = (u: Vertex): u is Text => u._tag === TEXT;

export const Base = proto.declare<Base>({
  [TypeId]: PRAGMA,
  _tag    : undefined as any,
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
});

export const Rest = proto.declare<Rest>({
  ...Base,
  _tag: REST,
});

export const Func = proto.declare<Func>({
  ...Base,
  _tag: FUNC,
});

export const Text = proto.declare<Text>({
  ...Base,
  [TypeId]: TypeId,
  _tag    : TEXT,
});

export const text = (text: PrimitiveValue) =>
  proto.init(Text, {
    text: text,
  });

export const ValenceId = Symbol.for('disreact/valence');

export interface Valence<A = any> extends Pipeable.Pipeable,
  Array<A>,
  Lineage.Lineage<A>,
  Hash.Hash,
  Equal.Equal
{
  [ValenceId]: typeof PRAGMA | typeof ValenceId;
}

export const isValence = (u: unknown): u is Valence => typeof u === 'object' && u !== null && ValenceId in u;

export const isPragmaValence = (u: Valence): u is Valence<Pragma> => u[ValenceId] === PRAGMA;

export const isVertexValence = (u: Valence): u is Valence<Vertex> => u[ValenceId] === ValenceId;

export const Valence = proto.declareArray<Valence>({
  [ValenceId]: PRAGMA,
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
});

export const PropsId = Symbol.for('disreact/props'),
      NONE    = 1 as const,
      JUST    = 2 as const,
      MANY    = 3 as const;

type None = typeof NONE;
type Just = typeof JUST;
type Many = typeof MANY;

type PropsTag = | None
                | Just
                | Many;

// @formatter:off
export type Props<A extends PropsTag = PropsTag, B = Pragma>
  = A extends None ? Record<string, any> & {[PropsId]: None}
  : A extends Just ? Record<string, any> & {[PropsId]: Just; children: B}
  : A extends Many ? Record<string, any> & {[PropsId]: Many; children: B[]}
  : never;
// @formatter:on

export const isProps = (u: unknown): u is Props => typeof u === 'object' && u !== null && PropsId in u;

export const isNone = (u: Props): u is Props<typeof NONE> => u[PropsId] === NONE;

export const isJust = (u: Props): u is Props<typeof JUST> => u[PropsId] === JUST;

export const isMany = (u: Props): u is Props<typeof MANY> => u[PropsId] === MANY;

export const Props = proto.declare<Props>({
  [PropsId]: NONE,
});

export const propsNone = (attrs: Props): Props =>
  proto.init(Props, attrs);

export const propsJust = (attrs: Props): Props => {
  const self = proto.init(Props, attrs);
  self[PropsId] = JUST;
  return self;
};

export const propsMany = (attrs: Props): Props => {
  const self = proto.init(Props, attrs);
  self[PropsId] = MANY;
  return self;
};
