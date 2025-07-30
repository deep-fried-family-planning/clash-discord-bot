import type * as Polymer from '#disreact/model/internal/Polymer.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import {pipe} from 'effect/Function';
import * as Envelope from '#disreact/model/internal/Envelope.ts';
import * as Hydrant from '#disreact/model/runtime/Hydrant.ts';
import * as Effect from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Option from 'effect/Option';
import type * as Record from 'effect/Record';
import * as Lifecycle from '#disreact/model/lifecycles.ts';

export const bootstrapFC = <P, D>(
  fc: Jsx.FC<P>,
  props: P,
  data?: D,
) =>
  pipe(
    Hydrant.fromRegistry(fc, props),
    Effect.flatMap(Envelope.make(data)),
    Effect.flatMap(Lifecycle.initializeCycle),
  );

export const bootstrapRoot = <D>(
  root: Jsx.Jsx,
  data?: D,
) =>
  pipe(
    Hydrant.fromRegistry(root),
    Effect.flatMap(Envelope.make(data)),
  );

export const rehydrate = <D>(
  hydrator: Hydrant.Hydrator,
  event: Hydrant.Event,
  data?: D,
) =>
  pipe(
    Hydrant.fromHydrator(hydrator),
    Effect.flatMap(Envelope.make(data)),
    Effect.tap((env) =>
      pipe(
        Lifecycle.hydrateCycle(env),
        Effect.andThen(Lifecycle.dispatchCycle(env, event)),

        Effect.fork,
      ),
    ),
  );
