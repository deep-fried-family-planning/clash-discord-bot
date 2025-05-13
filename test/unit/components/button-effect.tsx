import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const ButtonEffect = () =>
  pipe(
    E.succeed(
      <button
        label={'ButtonEffect'}
        onclick={() => E.void}
      />,
    ),
  );
