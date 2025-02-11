import {Link} from '#src/discord/omni-board/link/link.tsx';
import {OmniPrivate} from '#src/discord/omni-board/omni-private.tsx';
import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {IxContext} from '#src/disreact/internal/layer/IxContext.ts';
import {StaticDOM} from '#src/disreact/internal/layer/StaticDOM.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';
import * as process from 'node:process';



export const runtimeLayer = pipe(
  L.empty,
  L.provideMerge(IxContext.makeLayer()),
  L.provideMerge(StaticDOM.makeLayer([
    OmniPublic,
    OmniPrivate,
    Link,
  ])),
  L.provideMerge(DiscordDOM.defaultLayer),
  L.provideMerge(DokenMemory.dynamoLayer(process.env.DDB_OPERATIONS)),
);
