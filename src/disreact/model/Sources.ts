import * as E from 'effect/Effect';

export class Sources extends E.Service<Sources>()('disreact/Sources', {
  effect: E.fnUntraced(function* () {
    return {};
  }),
  accessors: true,
})
{}
