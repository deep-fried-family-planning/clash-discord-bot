import type {Defer} from '#src/disreact/api/defer.ts';
import {Broker} from '#src/disreact/runtime/layer/DisReactBroker.ts';
import {E, flow, L, pipe} from '#src/internal/pure/effect.ts';
import {Supervisor} from 'effect';



const program = () => E.gen(function * () {
  const semaphore  = yield * E.makeSemaphore(1);
  const mutex      = semaphore.withPermits(1);
  const supervisor = yield * Supervisor.track;

  return {
    getSupervisor: () => supervisor,

    withMutex: mutex,

    delete: () => pipe(Broker.deleteResponse, E.fork, mutex),
    defer : flow(Broker.deferResponse, E.fork, mutex),
    reply : () => pipe(Broker.renderResponse, E.fork, mutex),
    update: () => pipe(Broker.updateResponse, E.fork, mutex),
    // renderTarget : () => mutex(Broker),
  };
});



export class FiberDOM extends E.Tag('DisReact.FiberDOM')<
  FiberDOM,
  E.Effect.Success<ReturnType<typeof program>>
>() {
  static makeLayer = () => L.effect(this, program());
}
