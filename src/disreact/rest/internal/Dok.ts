import type * as Snowflake from '#disreact/rest/schema/Snowflake.ts';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
import type {Discord} from 'dfx';

import type * as DateTime from 'effect/DateTime';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import * as Redacted from 'effect/Redacted';

const CACHE_NULL = Redacted.make('');

type State = | 'Fresh'
             | 'Defer'
             | 'Cache'
             | 'Done';

type Type = | 'Modal'
            | 'Source'
            | 'Update'
            | 'Delete';

export interface Doken<S extends State = State, T extends Type = Type> extends Inspectable.Inspectable, Pipeable.Pipeable {
  app  : Snowflake.Snowflake;
  id   : Snowflake.Snowflake;
  state: S;
  type : S extends 'Fresh' ? T : undefined;
  value: Redacted.Redacted<string>;
  until: DateTime.Utc;
  flags: number | undefined;
}

const DokenPrototype = declareProto<Doken>({
  app  : undefined as any,
  state: undefined as any,
  type : undefined,
  id   : undefined as any,
  value: undefined as any,
  until: undefined as any,
  flags: undefined as any,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id  : 'DiscordInteractionToken',
      app  : this.app,
      state: this.state,
      type : this.type,
      id   : this.id,
      until: this.until,
      flags: this.flags,
    };
  },
});

export interface Input<S extends State = State, T extends Type = Type> {
  app  : string;
  id   : string;
  state: S;
  type : S extends 'Fresh' ? T : undefined;
  value: string | undefined;
  flags: number | undefined;
}

export const make = <S extends State, T extends Type>(input: Input<S, T>): Doken<S, T> => {
  const self = fromProto(DokenPrototype);
  self.app = input.app;
  self.state = input.state;
  self.type = input.type;
  self.id = input.id;
  self.value = input.value ? Redacted.make(input.value) : CACHE_NULL;
  self.flags = input.flags;
  return self;
};

export const fresh = (ix: Discord.APIInteraction): Doken => {
  const self = fromProto(DokenPrototype);
};

export interface Value {
  app  : Snowflake.Snowflake;
  id   : Snowflake.Snowflake;
  value: string;
  flags: 64 | undefined;
}

export const value = <A extends Doken>(self: A): Value => {
  if (!self.type || self.value === CACHE_NULL) {
    throw new Error();
  }
  return {
    app  : self.app,
    id   : self.id,
    value: Redacted.value(self.value),
    flags: self.flags === 64 ? 64 : undefined,
  };
};
