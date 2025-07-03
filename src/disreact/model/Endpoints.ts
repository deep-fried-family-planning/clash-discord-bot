import * as E from 'effect/Effect';
import * as Data from 'effect/Data';

export class Endpoints extends E.Service<Endpoints>()('disreact/Endpoints', {
  effect: E.fnUntraced(function* (config: EndpointsConfig) {
    return {
      synthesize: () => {},
      rehydrate : () => {},
    };
  }),
  accessors: true,
}) {}
