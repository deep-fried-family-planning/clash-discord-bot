import {Broker} from '#disreact/runtime/layer/DisReactBroker.ts';
import {E, L} from '#pure/effect';
import {Supervisor} from 'effect';



const program = () => E.gen(function * () {
  const semaphore  = yield * E.makeSemaphore(1);
  const mutex      = semaphore.withPermits(1);
  const supervisor = yield * Supervisor.track;

  return {
    getSupervisor: () => supervisor,
    withMutex    : mutex,
    renderDefer  : () => mutex(Broker.deferResponse()),
    renderReply  : () => mutex(Broker.renderResponse()),
    renderEdit   : () => mutex(Broker.updateResponse()),
    // renderTarget : () => mutex(Broker),
  };
});



export class FiberDOM extends E.Tag('DisReact.FiberDOM')<
  FiberDOM,
  E.Effect.Success<ReturnType<typeof program>>
>() {
  static makeLayer = () => L.effect(this, program());
}
