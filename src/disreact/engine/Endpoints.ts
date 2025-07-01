import * as E from 'effect/Effect';
import * as Data from 'effect/Data';
import type * as Hydrant from '#disreact/core/Hydrant.ts';

export type EndpointsConfig = Hydrant.Endpoint[];

export class Endpoints extends E.Service<Endpoints>()('disreact/Endpoints', {
  effect: E.fnUntraced(function* (config: EndpointsConfig) {
    return {

    };
  }),
  accessors: true,
}) {}
