import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Jsx from '#disreact/model/entity/Jsx.tsx';
import {pipe} from 'effect/Function';
import type * as Event from '#disreact/model/core/Event.ts';
import * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Hydrant from '#disreact/model/core/Hydrant.ts';
import * as Effect from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Option from 'effect/Option';
import type * as Record from 'effect/Record';

export interface Hydrator {
  id   : string;
  props: Record<string, any>;
}

export const synthesizeFC = <P, D>(fc: Jsx.FC<P>, props: P, data: D) =>
  pipe(
    Hydrant.fromSource(fc, props),
    Envelope.fromHydrant(data),
    Effect.tap((envelope) =>
      pipe(

      ),
    ),
    Effect.map((envelope) => envelope.stream),
  );

export const synthesizeJsx = (
  component: Jsx.Jsx,
  data: any,
) => {};

export const simulate = (sim: Envelope.Simulant) => {
  const entrypoint = Jsx.findEntrypoint(hydrant.id);

  if (!entrypoint) {
    throw new Error('Invalid Entrypoint');
  }

  return pipe(

  );
};
