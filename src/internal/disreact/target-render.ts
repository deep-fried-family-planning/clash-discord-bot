import {E} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Nd} from 'src/internal/disreact/virtual/entities/index.ts';



export const targetRender = E.fn('DisReact.targetRender')(
  function * (channel_id: str, root: str | {[k: str]: Nd.Fn}) {

  },

  E.withLogSpan('targetRender_ms'),
);
