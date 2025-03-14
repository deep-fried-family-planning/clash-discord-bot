import {EMPTY, EMPTY_NUM} from '#src/disreact/codec/constants/common.ts';
import {OldRoot} from '#src/disreact/model/RootRegistry.ts';
import * as Globals from '#src/disreact/model/a/globals.ts';
import * as Lifecycles from '#src/disreact/model/a/index.ts';
import {E, RDT} from '#src/internal/pure/effect.ts';
import type * as FC from '#src/disreact/model/entity/fc.ts';
import {Doken, RouteCodec} from '../codec/index.ts';



export const synthesize = (fn: FC.FC) => E.gen(function* () {
  const root = yield* OldRoot.synthesizeClone(fn);

  Globals.nullifyPointer();
  Globals.mountRoot(root.pointer, root.fiber);

  root.element       = yield* Lifecycles.initialRender(root.element);
  root.fiber.next.id = root.root_id;
  const encoded      = RouteCodec.encodeMessage(
    root,
    {
      fresh: Doken.make({
        id       : EMPTY,
        type     : EMPTY_NUM,
        ephemeral: EMPTY_NUM,
        value    : RDT.make(EMPTY),
        ttl      : 0,
      }),
    },
  );

  return encoded;
});
