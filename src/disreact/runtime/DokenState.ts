import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Fiber} from 'effect';

export class DokenState extends E.Service<DokenState>()('disreact/DokenState', {
  effect: pipe(
    E.all([

    ]),
    E.map(() => {
      let fiber = Fiber.void as Fiber.RuntimeFiber<any> | Fiber.Fiber<any>;
      fiber = fiber.parent;

      return {

      };
    }),
  ),
  accessors: true,
}) {}
