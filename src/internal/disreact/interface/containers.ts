import {Ar} from '#pure/effect';
import {CI, EI} from '#src/internal/disreact/interface/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Co, Df} from 'src/internal/disreact/virtual/entities/index.ts';
import {NONE} from 'src/internal/disreact/virtual/kinds/constants.ts';



export type MessageParams = (EI.T | CI.T[])[];
export type DialogParams = [{title: str}, ...CI.T[][]];


export const makePublic = (...params: MessageParams) => {
  const embeds = params.filter((p) => !Ar.isArray(p)) as EI.T[];
  const components = params.filter((p) => Ar.isArray(p)) as CI.T[][];

  return Co.Message({
    defer     : Df.Public,
    embeds    : EI.modelAll(embeds),
    components: CI.modelAll(components),
  });
};


export const makePrivate = (...params: MessageParams) => {
  const embeds = params.filter((p) => !Ar.isArray(p)) as EI.T[];
  const components = params.filter((p) => Ar.isArray(p)) as CI.T[][];

  return Co.Message({
    defer     : Df.Private,
    embeds    : EI.modelAll(embeds),
    components: CI.modelAll(components),
  });
};


export const makeDialog = (...params: DialogParams) => {
  const [header, ...components] = params;

  return Co.Dialog({
    defer     : Df.OpenDialog,
    custom_id : NONE,
    title     : header.title,
    components: CI.modelAll(components),
  });
};
