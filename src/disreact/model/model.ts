import type * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.ts';
import {pipe} from 'effect/Function';
import type * as Fn from '#disreact/model/core/Fn.ts';

export const synthesizeFC = (
  fc: Fn.JsxFC,
  props: any,
  data: any,
) => {
  const entrypoint = Jsx.findEntrypoint(fc);
};

export const simulate = (
  hydrant: Polymer.Hydrant,
  event: Jsx.Event,

) => {
  const entrypoint = Jsx.findEntrypoint(hydrant.id);

  if (!entrypoint) {
    throw new Error('Invalid Entrypoint');
  }

  return pipe(

  );
};
