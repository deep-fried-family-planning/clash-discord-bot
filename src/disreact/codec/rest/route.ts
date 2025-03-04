import {SnowFlake} from '#src/disreact/codec/constants/common.ts';
import {Dokens, Event} from '#src/disreact/codec/rest/index.ts';
import type {Schema} from 'effect/Schema';
import {Any, mutable, Struct, Union} from 'effect/Schema';
import {DialogParams, EmbedParams, Params} from 'src/disreact/codec/rest/index.ts';



export const T = mutable(Struct({
  request: Any,
  id     : SnowFlake,
  params : Union(DialogParams.T, EmbedParams.T),
  dokens : Dokens.T,
  event  : Event.T,
}));

export type T = Schema.Type<typeof T>;

export const decodeRouteFromRequest = (request: any): T => {
  const dokens = Dokens.make(request);
  const params = Params.decodeFromRequest(request);
  const event  = DialogParams.is(params)
    ? Event.decodeRequestEvent(request, params.custom_id)
    : Event.decodeRequestEvent(request);

  return {
    request,
    id    : request.id,
    params,
    dokens: Dokens.add(dokens, params),
    event,
  };
};
