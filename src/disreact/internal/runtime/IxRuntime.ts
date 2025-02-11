import {Link} from '#src/discord/omni-board/link/link.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import type {Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {StaticGraph} from '#src/disreact/internal/model/StaticGraph.ts';
import {IxScope} from '#src/disreact/internal/runtime/IxScope.ts';
import type {RenderFn} from '#src/disreact/internal/types.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import * as process from 'node:process';



export const runtimeLayer = pipe(
  L.empty,
  L.provideMerge(IxScope.makeLayer()),
  L.provideMerge(StaticGraph.singleton({
    persistent: [
      OmniPublic,
    ],
    ephemeral: [
      OmniPrivate,
      Link,
    ],
    dialog: [],
  })),
  L.provideMerge(DiscordDOM.defaultLayer),
  L.provideMerge(DokenMemory.dynamoLayer(process.env.DDB_OPERATIONS)),
);


export type DisReactRuntimeConfig = {
  bot_token: string;

  trees: {
    entry    : RenderFn[];
    ephemeral: RenderFn[];
    dialog   : RenderFn[];
  };
};


export class IxRuntime extends E.Tag('DisReact.IxRuntime')<
  IxRuntime,
  {
    interact      : (rest: Rest.Ix) => void;
    synthesizeRoot: (fn: RenderFn) => Rest.Message;
  }
>() {
  static configure = (config: DisReactRuntimeConfig) => pipe(
    E.gen(function * () {

    }),
  );
}
