import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import type * as Jsx from '#disreact/model/entity/Jsx.tsx';
import {pipe} from 'effect/Function';
import type * as Event from '#disreact/model/core/Event.ts';
import * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import * as Effect from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Option from 'effect/Option';
import type * as Record from 'effect/Record';
import * as Lifecycle from '#disreact/model/lifecycle.ts';

export const bootstrap = <P, D>(fc: Jsx.FC<P>, props: P, data?: D) =>
  pipe(
    Hydrant.fromRegistry(fc, props),
    Effect.flatMap(Envelope.make(data)),
    Effect.flatMap(Lifecycle.initializeCycle),
  );

export const rehydrate = (hydrator: Hydrant.Hydrator) =>
  pipe(

  );

export const render = (hydrator: Hydrant.Hydrator) =>
 pipe();
