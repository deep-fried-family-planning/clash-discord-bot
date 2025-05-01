import {DisReact} from '#src/disreact/runtime/DisReact.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {Interaction} from 'dfx/types';
import console from 'node:console';

export const ix_components = (ix: Interaction) =>
  pipe(
    DisReact.respond(ix),
    E.tapDefect((e) => {
      console.error(e);
      return E.void;
    }),
  );
