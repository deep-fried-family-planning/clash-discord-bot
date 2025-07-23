import type * as Polymer from '#disreact/internal/Polymer.ts';
import * as Jsx from '#disreact/internal/Jsx.tsx';
import {pipe} from 'effect/Function';
import type * as Event from '#disreact/internal/core/Event.ts';
import * as Envelope from '#disreact/internal/Envelope.ts';
import * as Hydrant from '#disreact/internal/core/Hydrant.ts';
import * as Effect from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';

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
