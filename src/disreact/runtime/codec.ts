import {Auth, Doken, Events, NONE, Rest} from '#src/disreact/enum/index.ts';
import {decodeUrl, encodeAsPath, encodeAsUrl} from '#src/disreact/enum/routes.ts';
import {encodeEntireTree} from '#src/disreact/model/dsx/encode-element.ts';
import {encodeHooks} from '#src/disreact/model/hooks/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {accumulateStates} from '#src/disreact/model/traversal.ts';
import {CriticalFailure, InteractionContext} from '#src/disreact/runtime/service.ts';
import {E} from '#src/internal/pure/effect.ts';
import {inspect} from '#src/internal/pure/pure.ts';
import type {Discord} from 'dfx/index';



export const decodeInteraction = E.fn('DisReact.decodeInteraction')(function * (rest: Rest.Interaction) {
  if (rest.type === Rest.PING) return yield * new CriticalFailure({});
  if (rest.type === Rest.AUTOCOMPLETE) return yield * new CriticalFailure({});
  if (rest.type === Rest.COMMAND) return yield * new CriticalFailure({});

  const context = yield * InteractionContext.free();
  context.rest  = rest;
  context.auths = Auth.decodeAuths(rest);
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

  yield * E.logTrace('encoded', inspect(encoded, false, null));

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
