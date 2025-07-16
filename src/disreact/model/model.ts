import type * as Polymer from '#disreact/entity/Polymer.ts';
import * as Jsx from '#disreact/runtime/JsxRuntime.tsx';
import {pipe} from 'effect/Function';
import type * as Fn from '#disreact/entity/Fn.ts';
import type * as Event from '#disreact/entity/Event.ts';
import type * as Envelope from '#disreact/entity/Envelope.ts';

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
