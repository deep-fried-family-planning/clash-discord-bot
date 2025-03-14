import {InfoPanel} from '#src/discord/omni-board/info-panel.tsx';
import {LinkDialog} from '#src/discord/omni-board/link-dialog.tsx';
import {Link} from '#src/discord/omni-board/link.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import type {Rest} from '#src/disreact/codec/rest/index.ts';
import {InteractionDOM} from '#src/disreact/interface/InteractionDOM.ts';
import {DokenCache} from '#src/disreact/interface/DokenCache.ts';
import {OldRoot} from '#src/disreact/model/RootRegistry.ts';
import {InteractionBroker} from '#src/disreact/runtime/service/InteractionBroker.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import * as process from 'node:process';
import type * as FC from '#src/disreact/model/entity/fc.ts';



export const runtimeLayer = pipe(
  L.empty,
  L.provideMerge(InteractionBroker.makeLayer()),
  L.provideMerge(OldRoot.singleton({
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
  L.provideMerge(InteractionDOM.defaultLayer),
  L.provideMerge(DokenCache.dynamoLayer(process.env.DDB_OPERATIONS)),
);


export type DisReactRuntimeConfig = {
  bot_token: string;

  trees: {
    entry    : FC.FC[];
    ephemeral: FC.FC[];
    dialog   : FC.FC[];
  };
};


export class DisReactRuntime extends E.Tag('DisReact.IxRuntime')<
  DisReactRuntime,
  {
    interact      : (rest: Rest.Ix) => void;
    synthesizeRoot: (fn: FC.FC) => Rest.Message;
  }
>() {
  static configure = (config: DisReactRuntimeConfig) => pipe(
    E.gen(function* () {

    }),
  );
}
