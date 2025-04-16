import type {Relay} from '#src/disreact/model/Relay.ts';
import type { Mailbox} from 'effect';
import {FiberHandle} from 'effect';
import {E} from '../utils/re-exports.ts';



export class DokenManager extends E.Service<DokenManager>()('disreact/DokenManager', {
  effect: E.gen(function* () {
    const handle = yield* FiberHandle.make();

    return {
      listen: (mailbox: Mailbox.Mailbox<Relay.Progress>) => mailbox,
    };
  }),
}) {}
