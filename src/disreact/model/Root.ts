import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {TPriorityQueue} from 'effect';

export class Root extends E.Service<Root>()('disreact/Root', {
  effect: pipe(
    E.all({
      queue: TPriorityQueue.make(),
    }),
  ),
}) {}

TPriorityQueue.takeOption;
