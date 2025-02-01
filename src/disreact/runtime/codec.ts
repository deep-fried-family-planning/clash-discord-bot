import {DAuth, Doken, Events, NONE, Rest} from '#src/disreact/runtime/enum/index.ts';
import {decodeUrl, encodeAsPath, encodeAsUrl} from '#src/disreact/runtime/enum/droute.ts';
import {encodeEntireTree} from '#src/disreact/model/encode-element.ts';
import {encodeHooks} from '#src/disreact/model/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {accumulateStates} from '#src/disreact/model/traversal.ts';
import {CriticalFailure, InteractionContext} from '#src/disreact/runtime/service.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {Discord} from 'dfx/index';
import {inspect} from 'node:util';


const unsupported = [
  Rest.PING,
  Rest.AUTOCOMPLETE,
  Rest.COMMAND,
];


export const decodeInteraction = E.fn('DisReact.decodeInteraction')(function * (rest: Rest.Interaction) {
  if (unsupported.includes(rest.type)) {
    return yield * new CriticalFailure({
      why: 'unsupported interaction type',
    });
  }

  const context = yield * InteractionContext.free();
  context.rest  = rest;
  context.auths = DAuth.decodeAuths(rest);
  context.route = yield * decodeUrl(rest);

  if (rest.type === Rest.InteractionType.MESSAGE_COMPONENT) {
    const target = Rest.findTarget(rest.data.custom_id, rest.message!.components);

    if (!target) {
      return yield * new CriticalFailure({});
    }
    context.event = Events.decodeEvent(target);
  }
  if (rest.type === Rest.InteractionType.MODAL_SUBMIT) {
    context.event = Events.DialogSubmit({
      id    : rest.data.custom_id,
      type  : 'onSubmit',
      target: {},
      values: rest.data.components.map((row) => ((row as Discord.ActionRow).components[0] as Discord.TextInput)),
    });
  }
  return yield * InteractionContext.save(context);
});



export const encodeInteraction = E.fn('DisReact.encodeInteraction')(function * (
  root: DisReactNode,
  doken?: Doken.T,
  rootName?: string,
) {
  const states  = accumulateStates(root);
  const encoded = encodeEntireTree(root);
  const params  = {
    root: rootName ?? root.parent?.name ?? NONE,
    node: root.name,
    ...Doken.encode(doken),
  };

  if ('custom_id' in encoded && encoded.custom_id === NONE) {
    const path    = encodeAsPath({...params, token: NONE});
    const updated = {...encoded, custom_id: path};
    yield * E.logTrace('encoded', JSON.stringify(updated));
    return updated;
  }

  if ('embeds' in encoded) {
    const [e, ...es] = encoded.embeds;
    const url        = encodeAsUrl(params, encodeHooks(states));
    const updated    = {...encoded, embeds: [{...e, image: {url: url}}, ...es]};
    yield * E.logTrace('encoded', JSON.stringify(updated));
    return updated;
  }

  return encoded;
});
