import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import {pipe} from 'effect/Function';

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
