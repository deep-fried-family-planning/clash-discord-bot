import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Jsx from '#disreact/model/runtime/JsxRuntime.tsx';
import {pipe} from 'effect/Function';
import type * as Fn from '#disreact/model/entity/Fn.ts';
import type * as Event from '#disreact/model/entity/Event.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';

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
