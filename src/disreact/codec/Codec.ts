import {SubmitEventTag} from '#src/disreact/codec/constants/all.ts';
import {encodeMessageDsx} from '#src/disreact/codec/dsx/element-encode.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as FiberHash from '#src/disreact/codec/fiber/fiber-hash.ts';
import * as FiberPointer from '#src/disreact/codec/fiber/fiber-pointer.ts';
import * as FiberRoot from '#src/disreact/codec/fiber/fiber-root.ts';
import * as Events from '#src/disreact/codec/rest/events.ts';
import {Doken, NONE_STR} from '#src/disreact/codec/rest/index.ts';
import {DokenMemory} from '#src/disreact/interface/DokenMemory.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {DateTime} from 'effect';
import * as CodecTarget from './CodecTargets.ts';
import * as Route from './rest/route.ts';



export type Frame = {
  rest   : any;
  id     : string;
  pointer: FiberPointer.T;
  state  : FiberRoot.T;
  hash   : string;
  params : Route.Params;
  event  : Events.Type;
  dokens: {
    fresh: Doken.Type;
    rest?: Doken.Type;
  };
};



export const makeStaticFrame = (root: string): Frame => {
  const doken      = Doken.makeStatic();
  const state      = FiberRoot.make();
  state.graph.next = root;
  const hash       = FiberHash.hash(state);

  return {
    rest   : null,
    id     : NONE_STR,
    pointer: FiberPointer.make(NONE_STR),
    state,
    hash,
    params : {
      origin: 'Message',
      root,
      doken : {
        ...doken,
      },
      hash,
    },
    dokens: {
      fresh: doken,
    },
    event: null as never,
  };
};



export const decodeInteraction = E.fn(function* (rest: any) {
  const route  = CodecTarget.getRouteFromMessage(rest.message);
  const params = Route.decodeMessageRoute(route as never);
  const event  = Events.decodeEvent(rest);


  const state = FiberHash.decode(params.hash);
  state.rest  = rest;

  return {
    rest   : Object.freeze(rest),
    id     : rest.id,
    pointer: FiberPointer.make(rest.id),
    state,
    hash   : FiberHash.hash(state),
    params,
    event,
    dokens : yield* resolveDokens(rest, event, params),
  } as Frame;
});



const resolveDokens = E.fn(function* (
  rest: any,
  event: Events.Type,
  params: Frame['params'],
  time?: DateTime.Utc,
) {
  const fresh = yield* Doken.makeFresh({
    rest: rest,
    time,
  });

  if (
    Doken.isStatic(params.doken)
    || Doken.isSpent(params.doken)
  ) {
    return {
      fresh,
    };
  }

  if (Doken.isEphemeral(params.doken)) {
    return {
      fresh,
      rest: yield* Doken.makeFromParams(params.doken),
    };
  }

  if (event.kind === SubmitEventTag) {
    const memory = yield* DokenMemory.load(params.doken.id);

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
    rest: yield* Doken.makeFromParams(params.doken),
  };
});



export const encodeMessage = (frame: Frame, root: Element.T) => {
  const hash  = FiberHash.hash(frame.state);
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
