import type {Schema} from 'effect/Schema';
import {Union} from 'effect/Schema';
import {DialogParams, EmbedParams} from 'src/disreact/codec/rest/index.ts';



export const T = Union(
  DialogParams.T,
  EmbedParams.T,
);

export type T = Schema.Type<typeof T>;

export const decodeFromRequest = (request: any): T => {
  if (request.type === 3) {
    return EmbedParams.decodeMessageRouteFromRequest(request)!;
  }
  return DialogParams.decodeDialogParams(request.data.custom_id, request);
};
