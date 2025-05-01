import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import {Effect, Fiber, Layer, pipe} from 'effect';

export class DokenState extends Effect.Service<DokenState>()('disreact/DokenState', {
  effect: pipe(
    Effect.all([
      DokenMemory,
    ]),
    Effect.map(([memory]) => {
      // eslint-disable-next-line prefer-const
      let fiber = Fiber.void as Fiber.RuntimeFiber<any> | Fiber.Fiber<any>;

      return {};
    }),
  ),
  accessors: true,
}) {
  static readonly Fresh = Layer.fresh(DokenState.Default);
}
