/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {Defer, type Rest} from '#src/disreact/api/index.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {CLOSE_SWITCH, GlobalDefers, GlobalPages} from '#src/disreact/model/hooks/danger.ts';
import {renderTree} from '#src/disreact/model/lifecycles.ts';
import {findNode} from '#src/disreact/model/traversal.ts';
import {decodeInteraction, encodeInteraction} from '#src/disreact/runtime/codec.ts';
import {FiberDOM} from '#src/disreact/runtime/layer/FiberDOM.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {E} from '#src/internal/pure/effect.ts';



export const respond = E.fn('DisReact.respond')(function * (rest: Rest.Interaction) {
  const context = yield * decodeInteraction(rest);
  const params  = context.route;
  const states  = context.states;
  const event   = context.event;

  const cloned   = yield * StaticDOM.cloneNode(params.root, params.node);
  const hydrated = renderTree(cloned, states);
  const target   = findNode(hydrated, (node) => node.props.custom_id ? node.props.custom_id === event.id : node.relative_id === event.id);

  if (!target) {
    return yield * new CriticalFailure();
  }

  const nearest = target.handleEvent(event);
  const page    = GlobalPages.get(nearest);
  const defer   = GlobalDefers.get(nearest) ?? Defer.None();

  if (page === CLOSE_SWITCH || Defer.isClose(defer)) {
    yield * E.logTrace('deleting');
    yield * FiberDOM.delete();
    return;
  }

  if (page === params.node) {
    const rerendered = renderTree(hydrated);
    const encoded    = yield * encodeInteraction(hydrated);

    return yield * FiberDOM.reply();
  }

  if (page !== params.node) {
    const nextCloned   = yield * StaticDOM.cloneNode(params.root, page);
    const nextRendered = renderTree(nextCloned);
    const encoded      = yield * encodeInteraction(nextRendered);

    return yield * FiberDOM.reply();
  }
});
