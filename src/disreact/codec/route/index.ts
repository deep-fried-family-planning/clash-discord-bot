import {SnowFlake} from '#src/disreact/codec/constants/common.ts';
import {CLICK} from '#src/disreact/codec/rest/rest.ts';
import * as Dokens from '#src/disreact/codec/route/dokens.ts';
import * as Event from '#src/disreact/codec/route/event.ts';
import {Any, mutable, type Schema, Struct, Union} from 'effect/Schema';
import * as DialogParams from './dialog-params.ts';
import * as MessageRoute from './message-route.ts';

export * from './dialog-params.ts';
export * from './message-route.ts';
export * as Event from './event.ts';

export const Route = mutable(Struct({
  request: Any,
  id     : SnowFlake,
  params : Union(DialogParams.DialogParams, MessageRoute.MessageRoute),
  dokens : Dokens.Dokens,
  event  : Event.Event,
}));

export type Route = Schema.Type<typeof Route>;

export const decodeRequestRoute = (request: any): Route => {
  const dokens = Dokens.makeDokens(request);

  if (request.type === CLICK) {
    const params = MessageRoute.decodeMessageRouteFromRequest(request)!;
    const event  = Event.decodeRequestEvent(request);
    dokens.defer = params.doken;

    return {
      request,
      id: request.id,
      params,
      dokens,
      event,
    };
  }

  const params = DialogParams.decodeDialogParams(request.data.custom_id, request);
  const event  = Event.decodeRequestEvent(request, params.custom_id);
  dokens.defer = params.message?.doken;

  return {
    request,
    id: request.id,
    params,
    dokens,
    event,
  };
};
