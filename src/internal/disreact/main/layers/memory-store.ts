import {E, L} from '#pure/effect';
import type {VDialog, VEvent} from '#src/internal/disreact/entity/index.ts';
import {type Auth, type Ix, VDocument, VMessage} from '#src/internal/disreact/entity/index.ts';
import type {rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';


const implementation = () => E.gen(function * () {
  const documents = {} as rec<VDocument.T>;
  let interaction = {} as Ix.Rest;
  let curr        = VDocument.makeEmpty();
  let events      = [] as VEvent.VEvent[];

  return {
    allocate: (rest: Ix.Rest) => {
      interaction = rest;
      curr        = VDocument.makeEmpty();
      events      = [];
    },
    rest: () => interaction,
    curr: () => curr,

    update: (fn: (v: typeof curr) => typeof curr) => {
      curr = fn(curr);
      return curr;
    },

    nextEvent: () => events.shift(),
    pushEvent: (event: VEvent.VEvent) => {
      events.push(event);
    },
    unshiftEvent: (event: VEvent.VEvent) => {
      events.unshift(event);
    },

    saveDocument: (id: str, data: Dx.T) => {
      documents[id] = data;
    },
    loadDocument: (id: str) => documents[id],

    saveDialog: (id: str, data: VDialog.T) => {

    },
    loadDialogMessage: (id: str) => {
      return VMessage.makeEmpty();
    },

    getAuths: () => [] as Auth.T[],
  };
});


export class MemoryStore extends E.Tag('MemoryStore')<
  MemoryStore,
  EAR<typeof implementation>
>() {
  static makeLayer = () => L.effect(this, implementation());
}
