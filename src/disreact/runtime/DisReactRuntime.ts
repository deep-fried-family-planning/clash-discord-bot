import {InfoPanel} from '#src/discord/omni-board/info-panel.tsx';
import {LinkDialog} from '#src/discord/omni-board/link-dialog.tsx';
import {Link} from '#src/discord/omni-board/link.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import type {Rest} from '#src/disreact/codec/abstract/index.ts';
import type {RenderFn} from '#src/disreact/dsx/lifecycle.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {StaticGraph} from '#src/disreact/lifecycle/StaticGraph.ts';
import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import * as process from 'node:process';



export const runtimeLayer = pipe(
  L.empty,
  L.provideMerge(DisReactFrame.makeLayer()),
  L.provideMerge(StaticGraph.singleton({
    persistent: [
      OmniPublic,
    ],
    ephemeral: [
      OmniPrivate,
      Link,
      InfoPanel,
    ],
    dialog: [
      LinkDialog,
    ],
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


export class DisReactRuntime extends E.Tag('DisReact.IxRuntime')<
  DisReactRuntime,
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
