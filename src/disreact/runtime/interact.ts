import {CLOSE, Doken, NONE_STR, type Rest} from '#src/disreact/abstract/index.ts';
import {BadInteraction} from '#src/disreact/interface/error.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {decodeInteraction, encodeMessageInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {__acquire, __ctxread, __ctxwrite, dispatchEvent, emptyHooks, hydrateRoot, rerenderRoot} from '#src/disreact/internal/index.ts';
import {FiberInteractionDOM, type IxContext} from '#src/disreact/internal/layer/FiberInteractionDOM.ts';
import {StaticDOM} from '#src/disreact/internal/layer/StaticDOM.ts';
import type {HooksById, Pragma} from '#src/disreact/internal/types.ts';
import {E} from '#src/internal/pure/effect.ts';



export const interact = (rest: Rest.Ix) => E.gen(function * () {
  const ix   = yield * normalize(rest);
  const root = yield * StaticDOM.checkoutRoot(ix.root);

  const states = {} as HooksById;
  for (const [id, stack] of Object.entries(ix.stacks)) {
    states[id]       = emptyHooks(id);
    states[id].stack = stack;
  }
  const inputCtx = {
    rest     : structuredClone(rest),
    root     : ix.root,
    next     : NONE_STR,
    ephemeral: true,
  };

  __acquire(ix.ixid);
  __ctxwrite(inputCtx);

  const hydrated = hydrateRoot(root, states);

  // todo run effects / rerender

  const dispatched = dispatchEvent(hydrated, ix.event);

  const ctx = __ctxread();
  ix.next = ctx.next;

  if (isClose(ix)) {
    return yield * closeResponse();
  }

  const rerendered = rerenderRoot(dispatched);


  switch (ix.event.type) {
    case 'onsubmit': {
      return yield * submitResponse(rerendered);
    }
    case 'onclick': {
      return yield * clickResponse(rerendered);
    }
  }
});



const submitResponse = (root: Pragma) => E.gen(function * () {
  const ix = yield * FiberInteractionDOM.read();

  if (isSameRoot(ix)) {
    return yield * new BadInteraction({
      cause: 'Modal root is the same as the previous one.',
    });
  }

  ix.doken = yield * DokenMemory.load(ix.params.id);

  if (ix.doken) {
    yield * E.fork(DiscordDOM.acknowledge(ix.contingencyDoken));
  }
  else {

  }

  yield * FiberInteractionDOM.free();
});



const clickResponse = (root: Pragma) => E.gen(function * () {
  const ix = yield * FiberInteractionDOM.read();

  if (isSameRoot(ix)) {
    if (ix.doken) {
      yield * E.fork(DiscordDOM.acknowledge(ix.contingencyDoken));

      const encoded = encodeMessageInteraction(root, ix.params, ix.doken);

      return yield * DiscordDOM.reply();
    }
  }
  else {

  }
});



const closeResponse = () => E.gen(function * () {
  const ix = yield * FiberInteractionDOM.read();

  if (ix.doken) {
    const doken = Doken.validateTTL(ix.doken);

    if (doken) {
      return yield * E.forkAll([
        DiscordDOM.dismount(doken),
        DokenMemory.free(doken.id),
      ]);
    }
  }

  yield * DiscordDOM.acknowledge(ix.contingencyDoken);
  yield * E.fork(DiscordDOM.dismount(ix.contingencyDoken));
});



const normalize = (rest: Rest.Interaction) => E.gen(function * () {
  const ix            = yield * FiberInteractionDOM.free();
  const data          = yield * decodeInteraction(rest);
  ix.rest             = rest;
  ix.start_ms         = data.start_ms;
  ix.ixid             = data.symbol;
  ix.contingencyDoken = data.contingencyDoken;
  ix.doken            = data.doken;
  ix.params           = data.params;
  ix.stacks           = data.stacks;
  ix.event            = data.event;
  ix.root             = data.params.root;

  return yield * FiberInteractionDOM.save(ix);
});



const isClose    = (ix: IxContext) => ix.next === CLOSE;
const isSameRoot = (ix: IxContext) => ix.next === NONE_STR || ix.next === ix.root;
const isClick    = (ix: IxContext) => ix.event.type === 'onclick';
const isSubmit   = (ix: IxContext) => ix.event.type === 'onsubmit';
