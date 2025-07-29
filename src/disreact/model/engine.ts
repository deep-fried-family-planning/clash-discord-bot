import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import type * as Jsx from '#disreact/model/entity/Jsx.tsx';
import {pipe} from 'effect/Function';
import * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import * as Effect from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Option from 'effect/Option';
import type * as Record from 'effect/Record';
import * as Lifecycle from '#disreact/model/lifecycle.ts';

export const bootstrapFC = <P, D>(fc: Jsx.FC<P>, props: P, data?: D) =>
  pipe(
    Hydrant.fromRegistry(fc, props),
    Effect.flatMap(Envelope.make(data)),
    Effect.flatMap(Lifecycle.initializeCycle),
  );

export const bootstrapRoot = <P, D>(root: Jsx.Jsx, data?: D) =>
  pipe(
    Envelope.make(root.data),
  );

export const rehydrate = (hydrator: Hydrant.Hydrator) =>
  pipe(

  );

export const render = (hydrator: Hydrant.Hydrator) =>
 pipe();
