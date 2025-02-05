import {Auth, type Rest} from '#src/disreact/abstract/index.ts';
import {__malloc, dispatchEvent, hydrateRoot} from '#src/disreact/internal/index.ts';
import {makeDEvent} from '#src/disreact/internal/layer/Codec.ts';
import {InteractionDOM} from '#src/disreact/internal/layer/InteractionDOM.ts';
import {StaticDOM} from '#src/disreact/internal/layer/StaticDOM.ts';
import type {Pragma} from '#src/disreact/internal/types.ts';
import {E} from '#src/internal/pure/effect.ts';



export const react = (rest: Rest.Interaction) => E.gen(function * () {
  const ix = yield * InteractionDOM.free();
  ix.id    = __malloc(rest.id);
  ix.auths = Auth.decodeAuths(rest);
  ix.event = yield * makeDEvent(rest);

  const root     = yield * StaticDOM.checkoutRoot(ix.root);
  const hydrated = hydrateRoot(root, ix.states);
  const after    = dispatchEvent(hydrated, ix.event);

  switch (ix.event.type) {
    case 'onsubmit': {
      return yield * respondSubmit(after);
    }
    case 'onclick': {
      return yield * respondClick(after);
    }
  }
});



const respondSubmit = (root: Pragma) => E.gen(function * () {

});



const respondClick = (root: Pragma) => E.gen(function * () {

});
