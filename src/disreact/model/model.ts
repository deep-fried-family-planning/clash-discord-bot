import type * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import {pipe} from 'effect/Function';
import type * as Fn from '#disreact/model/core/Fn.ts';
import type * as Event from '#disreact/model/Event.ts';
export const synthesizeHydrantFC = (
  hydrant: Polymer.Hydrant,
  props: any,
  data: any,
) => {
  const entrypoint = Jsx.findEntrypoint(hydrant.id);
};

export const synthesizeHydrantJsx = (
  jsx: Jsx.Jsx,
) => {};

export const simulateHydrantEvent = (
  hydrant: Polymer.Hydrant,
  event: Event.EventInput,

) => {
  const entrypoint = Jsx.findEntrypoint(hydrant.id);

  if (!entrypoint) {
    throw new Error('Invalid Entrypoint');
  }

  return pipe(

  );
};
