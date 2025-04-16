import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {Data} from '#src/disreact/utils/re-exports.ts';

export * as Diffs from '#src/disreact/model/entity/diffs.ts';

export type Sync = Data.TaggedEnum<{
  Skip  : {};
  Value : {};
  Set   : {};
  Update: {};
}>;
export const Sync = Data.taggedEnum<Sync>();

export const {Skip, Value, Set, Update, $match: matchSync} = Sync;

export type Effect = Data.TaggedEnum<{
  Mount   : {};
  Dismount: {};
  Replace : {};
  Render  : {};
}>;
export const Effect = Data.taggedEnum<Effect>();

export const {Mount, Dismount, Replace, Render, $match: matchEffect} = Effect;



export type Diffs = Data.TaggedEnum<{
  Skip    : {};
  Set     : {next: Elem};
  Update  : {prev: Elem; next: Elem};
  Mount   : {next: Elem};
  Dismount: {prev: Elem};
  Replace : {next: Elem};
  Render  : {elem: Elem.Task};
}>;
export const Diff = Data.taggedEnum<Diffs>();
