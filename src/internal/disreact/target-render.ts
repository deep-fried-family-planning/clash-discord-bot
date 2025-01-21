import {E} from '#pure/effect';
import type {Nd} from '#src/internal/disreact/virtual/entities/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const targetRender = E.fn('DisReact.targetRender')(
  function * (channel_id: str, root: str | {[k: str]: Nd.Fn}) {

  },

  E.withLogSpan('targetRender_ms'),
);
