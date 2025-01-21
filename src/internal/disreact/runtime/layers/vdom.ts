import {E, g, L} from '#pure/effect';
import type {Co} from '#src/internal/disreact/virtual/entities/index.ts';
import {type Nd, Un} from '#src/internal/disreact/virtual/entities/index.ts';
import type {EAR} from '#src/internal/types.ts';


const vdom = () => g(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex = semaphore.withPermits(1);

  let node = {} as Nd.T,
      container = {} as Co.T;

  return {
    mount: (next: Nd.T) => {
      Un.resetClose();
      Un.resetHooks();
      Un.getHookUpdaters();
      Un.resetNextNode();
      node = next;
      container = node.mount();
    },

    update: () => {
      container = node.mount();
      return {
        node,
        container,
        registry : Un.getHooks(),
        updaters : Un.getHookUpdaters(),
        next_node: Un.getNextNode(),
        close    : Un.getClose(),
      };
    },

    collect: () => {
      return {
        node,
        container,
        registry : Un.getHooks(),
        updaters : Un.getHookUpdaters(),
        next_node: Un.getNextNode(),
        close    : Un.getClose(),
      };
    },

    dismount: () => {
      const temp = {
        node     : {...node},
        container,
        registry : Un.getHooks(),
        updaters : Un.getHookUpdaters(),
        next_node: Un.getNextNode(),
        close    : Un.getClose(),
      };
      Un.resetClose();
      Un.resetHooks();
      Un.getHookUpdaters();
      Un.resetNextNode();
      node = {} as Nd.T;
      return temp;
    },
  };
});


export class VDOMInstance extends E.Tag('VDOM')<
  VDOMInstance,
  EAR<typeof vdom>
>() {
  static makeInstance = () => L.effect(this, vdom());
}
