import type {RestEmbed} from '#pure/dfx';
import {D} from '#src/internal/pure/effect.ts';


export type T = D.TaggedEnum<{
  Controller: RestEmbed;
  Basic     : RestEmbed;
}>;
export const C = D.taggedEnum<T>();


export const BasicEmbed      = C.Basic;
export const EmbedController = C.Controller;
