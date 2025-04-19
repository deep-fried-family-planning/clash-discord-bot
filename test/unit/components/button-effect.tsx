import {E, pipe} from '#src/disreact/utils/re-exports.ts';

export const ButtonEffect = () =>
  pipe(
    E.succeed(
      <button
        label={'ButtonEffect'}
        onclick={() => E.void}
      />,
    ),
  );
