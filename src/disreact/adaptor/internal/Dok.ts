import type * as Snowflake from '#disreact/codec/Snowflake.ts';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
// import * as Discord from 'dfx/types';
import {Discord} from 'dfx';
import * as Flags from 'dfx/Helpers/flags';
import type * as DateTime from 'effect/DateTime';
import {dual} from 'effect/Function';
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
      _id  : 'Doken',
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
  app   : string;
  id    : string;
  state : S;
  type? : S extends 'Fresh' ? undefined : T;
  value?: string | undefined;
  flags : number | undefined;
}
import * as Data from 'effect/Data';

export const make = <S extends State, T extends Type>(input: Input<S, T>): Doken<S, T> => {
  const self = fromProto(DokenPrototype) as Doken<S, T>;
  self.app = input.app;
  self.id = input.id;
  self.state = input.state;
  self.type = input.type as any;
  self.value = input.value ? Redacted.make(input.value) : CACHE_NULL;
  self.flags = input.flags;
  return Data.struct(self);
};

export const fromIx = (ix: Discord.APIInteraction): Doken<'Fresh'> =>
  make({
    app  : ix.application_id,
    id   : ix.id,
    state: 'Fresh',
    value: ix.token,
    flags: ix.message?.flags,
  });

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
  return Data.struct({
    app  : self.app,
    id   : self.id,
    value: Redacted.value(self.value),
    flags: !self.flags ? undefined :
           Flags.has(Discord.MessageFlags.Ephemeral)(self.flags) ? Discord.MessageFlags.Ephemeral :
           undefined,
  });
};
