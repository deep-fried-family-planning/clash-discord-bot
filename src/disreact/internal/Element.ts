import type * as Jsx from '#disreact/adaptor/model/runtime/jsx.tsx';
import {StructProto} from '#disreact/internal/core/constants.ts';
import type * as Traversable from '#disreact/internal/core/Traversable.ts';
import type {COMPONENT, FRAGMENT, INTRINSIC, TEXT} from '#disreact/internal/Elements.ts';
import type * as Envelope from '#disreact/internal/Envelope.ts';
import type * as Polymer from '#disreact/internal/Polymer.ts';
import type * as Effect from 'effect/Effect';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';
import type * as PrimaryKey from 'effect/PrimaryKey';

export type FCKind = | 'Sync'
                     | 'Async'
                     | 'Effect'
                     | undefined;

export interface FC<K extends FCKind = FCKind> extends Inspectable.Inspectable, Hash.Hash {
  _tag        : K;
  _id         : string;
  _state      : boolean;
  _props      : boolean;
  entrypoint? : string | undefined;
  displayName?: string;
  source      : string;

  <P = any, E = never, R = never>(props?: P):
    K extends 'Sync' ? Jsx.Children :
    K extends 'Async' ? Promise<Jsx.Children> :
    K extends 'Effect' ? Effect.Effect<Jsx.Children, E, R> :
    | Jsx.Children
    | Promise<Jsx.Children>
    | Effect.Effect<Jsx.Children, E, R>;
}

export interface Props extends Inspectable.Inspectable, Equal.Equal, Record<string, any> {
  children?: Jsx.Children;
}

const PropsPrototype: Props = {
  ...StructProto,
  ...Inspectable.BaseProto,
  toJSON(this: Props) {
    const self = {...this};
    delete self.children;
    return self;
  },
} as Props;

const makeProps = (props: any): Props =>
  ({
    ...props,
    ...PropsPrototype,
  });

export declare namespace Element {
  export type Tag = | typeof TEXT
                    | typeof FRAGMENT
                    | typeof INTRINSIC
                    | typeof COMPONENT;
  export type TType<T extends Tag> =
    T extends typeof TEXT ? undefined :
    T extends typeof FRAGMENT ? typeof Jsx.Fragment :
    T extends typeof INTRINSIC ? string :
    FC;
  export type TProps<T extends Tag> =
    T extends typeof TEXT ? undefined :
    Props;
}

export interface Elements extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  PrimaryKey.PrimaryKey,
  Traversable.Origin<Polymer.Polymer>,
  Traversable.Ancestor<Elements>,
  Traversable.Descendent<Elements>,
  Traversable.Key
{
  _tag   : string;
  _env   : Envelope.Envelope;
  polymer: Polymer.Polymer | undefined;
  key    : string | undefined;
  type   : Element.TType<T>;
  props  : Element.TProps<T>;
  text   : Jsx.Value;
}
