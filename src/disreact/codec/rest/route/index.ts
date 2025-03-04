export * as DialogParams from '#src/disreact/codec/rest/route/params/dialog-params.ts';
export * as EmbedParams from '#src/disreact/codec/rest/route/params/embed-params.ts';
export * as Event from 'src/disreact/codec/rest/route/event.ts';
import {SnowFlake} from '#src/disreact/codec/constants/common.ts';
import {CLICK} from '#src/disreact/codec/rest/rest.ts';
import * as Dokens from '#src/disreact/codec/rest/route/dokens.ts';
import * as Event from '#src/disreact/codec/rest/route/event.ts';
import * as DialogParams from '#src/disreact/codec/rest/route/params/dialog-params.ts';
import * as EmbedParams from '#src/disreact/codec/rest/route/params/embed-params.ts';
import {Any, mutable, type Schema, Struct, Union} from 'effect/Schema';



export const Route = mutable(Struct({
  request: Any,
  id     : SnowFlake,
  params : Union(DialogParams.DialogParams, EmbedParams.T),
  dokens : Dokens.Dokens,
  event  : Event.Event,
}));

export type Route = Schema.Type<typeof Route>;

export const decodeRequestRoute = (request: any): Route => {
  const dokens = Dokens.makeDokens(request);

  if (request.type === CLICK) {
    const params = EmbedParams.decodeMessageRouteFromRequest(request)!;
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
