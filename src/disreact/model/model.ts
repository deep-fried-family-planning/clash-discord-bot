import type * as Polymer from '#disreact/model/Polymer.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import {pipe} from 'effect/Function';
import type * as Fn from '#disreact/model/Fn.ts';
import type * as Event from '#disreact/model/Event.ts';
import type * as Envelope from '#disreact/model/Envelope.ts';

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

export const simulate = (sim: Envelope.Simulant) => {
  const entrypoint = Jsx.findEntrypoint(hydrant.id);

  if (!entrypoint) {
    throw new Error('Invalid Entrypoint');
  }

  return pipe(

  );
};
