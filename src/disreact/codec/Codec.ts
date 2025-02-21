import {SubmitEventTag} from '#src/disreact/codec/constants/all.ts';
import {Doken, NONE_STR} from '#src/disreact/codec/rest/index.ts';
import {encodeMessageDsx} from '#src/disreact/model/dsx/element-encode.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import {DokenMemory} from '#src/disreact/service.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {DateTime} from 'effect';
import * as CodecTarget from './CodecTargets.ts';
import * as Pointer from './entities/pointer.ts';
import * as RootState from './entities/root-state.ts';
import * as Events from './rest/events.ts';
import * as Route from './rest/route.ts';



export type Frame = {
  rest   : any;
  id     : string;
  pointer: Pointer.Type;
  state  : RootState.Type;
  hash   : string;
  params : Route.Params;
  event  : Events.Type;
  dokens: {
    fresh: Doken.Type;
    rest?: Doken.Type;
  };
};



export const makeStaticFrame = (root: string): Frame => {
  const doken = Doken.makeStatic();
  const state = RootState.make();
  const hash = RootState.makeHash(state);

  return {
    rest   : null,
    id     : NONE_STR,
    pointer: Pointer.make(NONE_STR),
    state,
    hash,
    params : {
      origin: 'Message',
      root,
      doken,
      hash,
    },
    dokens: {
      fresh: Doken.makeStatic(),
    },
    event: null as never,
  };
};



export const decodeInteraction = E.fn(function* (rest: any) {
  const route  = CodecTarget.getRouteFromMessage(rest.message);
  const params = Route.decodeMessageRoute(route as never);

  params.doken.app_id = rest.application_id;

  const state = params.hash === NONE_STR
    ? RootState.make()
    : RootState.makeFromHash(params.hash);

  return {
    rest   : Object.freeze(rest),
    id     : rest.id,
    pointer: Pointer.make(rest.id),
    state,
    hash   : RootState.makeHash(state),
    params,
    event  : Events.decodeEvent(rest),
    dokens : yield* resolveDokens(rest),
  } as Frame;
});



const resolveDokens = E.fn(function* (frame: Frame, time?: DateTime.Utc) {
  const fresh = yield* Doken.makeFresh({
    rest: frame.rest,
    time,
  });

  if (
    Doken.isStatic(frame.params.doken)
    || Doken.isSpent(frame.params.doken)
  ) {
    return {
      fresh,
    };
  }

  if (Doken.isEphemeral(frame.params.doken)) {
    return {
      fresh,
      rest: yield* Doken.makeFromParams(frame.params.doken),
    };
  }

  if (frame.event.kind === SubmitEventTag) {
    const memory = yield* DokenMemory.load(frame.params.doken.id);

    if (!memory) {
      return {
        fresh,
      };
    }

    return {
      fresh,
      rest: yield* Doken.makeFromParams(memory),
    };
  }

  return {
    fresh,
    rest: yield* Doken.makeFromParams(frame.params.doken),
  };
});



export const encodeMessage = (frame: Frame, root: Pragma) => {
  const hash  = RootState.makeHash(frame.state);
  const doken = frame.dokens.rest ?? frame.dokens.fresh;

  const route = Route.encodeMessageRoute({
    origin: 'Message',
    root  : frame.state.graph.next,
    doken,
    hash,
  });

  const message = encodeMessageDsx(root);

  return CodecTarget.setRouteForMessage(message, route);
};
