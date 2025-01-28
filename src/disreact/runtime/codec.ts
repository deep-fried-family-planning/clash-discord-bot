import {NONE, NONE_NUM} from '#src/disreact/api/constants.ts';
import {Auth, Defer, Rest} from '#src/disreact/api/index.ts';
import {findRestTarget} from '#src/disreact/api/rest.ts';
import {decodeUrl, encodeAsUrl} from '#src/disreact/api/routes.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {encodeEntireTree} from '#src/disreact/model/codec.ts';
import {encodeHooks} from '#src/disreact/model/hooks/hook-state.ts';
import {accumulateStates} from '#src/disreact/model/lifecycles.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {TokenMemory} from '#src/disreact/runtime/layer/TokenMemory.ts';
import {TTL} from '#src/disreact/runtime/types/index.ts';
import {E} from '#src/internal/pure/effect.ts';
import {inspectLogWith} from '#src/internal/pure/pure.ts';
import type {Discord} from 'dfx/index';



export const decodeInteraction = E.fn('DisReact.decodeInteraction')(function * (
  rest: Rest.Interaction,
) {
  switch (rest.type) {
    case Rest.InteractionType.PING:
    case Rest.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
    case Rest.InteractionType.APPLICATION_COMMAND:
      return yield * new CriticalFailure();
  }

  const route             = yield * decodeUrl(rest);
  const auths             = Auth.decodeAuths(rest);
  const ephemeral         = rest.message?.flags === Rest.MessageFlag.EPHEMERAL; // todo
  const context           = yield * ContextManager.allocate();
  context.id              = rest.id;
  context.app             = rest.application_id;
  context.rest            = rest;
  context.auths           = auths;
  context.route           = route.params;
  context.states          = route.states;
  context.ephemeral    = ephemeral;
  context.tokens.rest.id    = rest.id;
  context.tokens.rest.ttl   = TTL.withoutDefer();
  context.tokens.rest.value = rest.token;


  if (rest.type === Rest.InteractionType.MESSAGE_COMPONENT) {
    const target = findRestTarget(rest.data.custom_id, rest.message!.components);

    if (!target) {
      return yield * new CriticalFailure();
    }

    context.event.id     = target.custom_id!;
    context.event.type   = 'onClick';
    context.event.target = target;
    context.event.values = rest.data.values as unknown as string[] | undefined ?? [];
  }
  if (rest.type === Rest.InteractionType.MODAL_SUBMIT) {
    const values         = rest.data.components.map((row) => ((row as Discord.ActionRow).components[0] as Discord.TextInput).value ?? NONE);
    context.event.id     = rest.data.custom_id;
    context.event.type   = 'onSubmit';
    context.event.values = values;
  }


  if (
    !Defer.isNone(route.defer)
    && !Defer.isClose(route.defer)
    && route.params.id !== NONE
    && route.params.ttl !== `${NONE_NUM}`
    && route.params.ttl !== NONE
  ) {
    const ttl = parseInt(route.params.ttl);

    if (TTL.isActiveBuffered(ttl)) {
      yield * E.fork(TokenMemory.invalidate(route.params.id));
    }
    else {
      const prevToken = yield * TokenMemory.get(route.params.id);

      if (prevToken) {
        const defer                 = Defer.decodeDefer(prevToken.defer);
        context.tokens.prev.id        = route.params.id;
        context.tokens.prev.value     = prevToken.val;
        context.tokens.prev.ttl       = prevToken.ttl;
        context.tokens.prev.defer     = defer;
        context.tokens.prev.ephemeral = Defer.isEphemeral(defer);
      }
    }
  }

  return yield * ContextManager.setAll(context);
});



export const encodeInteraction = E.fn('DisReact.encodeInteraction')(function * (
  root: DisReactNode,
  id?: string,
  ttl?: string,
  defer?: Defer.Defer,
) {
  const states  = accumulateStates(root);
  const encoded = encodeEntireTree(root);

  if ('custom_id' in encoded && encoded.custom_id === NONE) {

  }

  if ('embeds' in encoded) {
    const url = encodeAsUrl(
      {
        root : root.parent?.name ?? NONE,
        node : root.name,
        id   : id ?? NONE,
        defer: defer ? Defer.encodeDefer(defer) : NONE,
        ttl  : ttl ?? NONE,
      },
      encodeHooks(states),
    );

    // @ts-expect-error mutability
    encoded.embeds[0].image = {url: url};
  }

  // inspectLogWith('states', states);
  inspectLogWith('encoded', encoded);

  return encoded;
});
