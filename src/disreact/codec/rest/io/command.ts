import {S} from '#src/internal/pure/effect.ts';
import { _Tag } from '../../common';



const TAG = _Tag.COMMAND;

export const I = S.Struct({
  options: S.Array(S.Any),
});

export type I = S.Schema.Type<typeof I>;

export const O = S.Struct({
  _tag: S.tag(TAG),
});

export type O = S.Schema.Type<typeof O>;

export const is = (out: any) => out._tag === TAG;

export const encode = ({_tag, ...rest}: O) => rest;
