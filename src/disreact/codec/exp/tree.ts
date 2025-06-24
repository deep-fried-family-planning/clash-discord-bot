import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
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

export interface Base<A = any> extends Pipeable.Pipeable,
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

export type Primitive = | undefined
                        | null
                        | boolean
                        | number
                        | bigint
                        | string;

export interface Text extends Base {
  _tag: typeof TEXT;
  text: Primitive;
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

export const Base = {
  [TypeId]: PRAGMA,
  _tag    : undefined,
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
};

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

export namespace Props {
  export type Base = Record<string, any>;
  // @formatter:off
  export type Props<A extends typeof NONE | typeof JUST | typeof MANY, B>
    = A extends typeof NONE ? Base & {[PropsId]: typeof NONE}
    : A extends typeof JUST ? Base & {[PropsId]: typeof JUST; children: B}
    : A extends typeof MANY ? Base & {[PropsId]: typeof MANY; children: B[]}
    : never;
  // @formatter:on
  export type All<A> = Props<typeof NONE | typeof JUST | typeof MANY, A>;
  export type None = Props<typeof NONE, never>;
  export type Just<A> = Props<typeof JUST, A>;
  export type Many<A> = Props<typeof MANY, A>;
}
export type Props = Props.Props<typeof NONE | typeof JUST | typeof MANY, any>;

export const isProps = (u: unknown): u is Props => typeof u === 'object' && u !== null && PropsId in u;
export const isNone = (u: Props): u is Props.None => u[PropsId] === NONE;
export const isJust = <A>(u: Props): u is Props.Just<A> => u[PropsId] === JUST;
export const isMany = <A>(u: Props): u is Props.Many<A> => u[PropsId] === MANY;

// export const Props: Props = {
//   [TypeId]: NONE,
// };
//
// export const propsNone = (attrs: Props.Base): Props.None =>
//   proto.instance(Props, {
//     [PropsId]: NONE,
//     ...attrs,
//   });
//
// export const propsJust = <A>(attrs: Props.Base): Props.Just<A> => {
//   const self = proto.instance(Props, {
//     [PropsId]: JUST,
//     ...attrs,
//   });
//   return self;
// };
//
// export const propsMany = <A>(attrs: Props.Base): Props.Many<A> => {
//   const self = proto.instance(Props, {...attrs});
//   self[PropsId] = MANY;
//   return self;
// };
