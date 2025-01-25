import {E} from '#pure/effect';
import {DisReactMemory} from '#src/internal/disreact/runtime/layers/disreact-memory.ts';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';
import {VDOMInstance} from '#src/internal/disreact/runtime/layers/vdom.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Ev} from 'src/internal/disreact/virtual/entities/index.ts';



export const mount = E.fn('lifecycles.mount')(
  function * (r: str, n: str) {
    const node = yield * DisReactMemory.getNode(r, n);

    yield * VDOMInstance.mount(node);

    return yield * VDOMInstance.collect();
  },
  SafeMutex.limit,
);


export const update = E.fn('lifecycles.update')(
  function * (event: Ev.T) {
    return yield * VDOMInstance.collect();
  },
  SafeMutex.limit,
);


export const simulate = E.fn('lifecycles.simulate')(
  function * (event: Ev.T) {
    return yield * E.fork(VDOMInstance.collect());
  },
  SafeMutex.limit,
);


export const dismount = E.fn('lifecycles.dismount')(
  function * () {
    return yield * VDOMInstance.dismount();
  },
  SafeMutex.limit,
);
