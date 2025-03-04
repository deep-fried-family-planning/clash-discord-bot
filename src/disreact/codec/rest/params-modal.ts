import {CustomId, RootId} from '#src/disreact/codec/constants/common.ts';
import * as MessageRoute from '#src/disreact/codec/rest/params-embed.ts';
import {decodeSync, encodeSync, mutable, optional, type Schema, Struct, tag, TemplateLiteralParser} from 'effect/Schema';



const DIALOG_ROUTE_TAG    = 'DialogRoute';
const DIALOG_ROUTE_PREFIX = '/dsx/';

export const T = mutable(Struct({
  _tag     : tag(DIALOG_ROUTE_TAG),
  root_id  : RootId,
  custom_id: CustomId,
  message  : optional(MessageRoute.T),
}));

export type T = Schema.Type<typeof T>;

export const is = (self: any): self is T => self._tag === DIALOG_ROUTE_TAG;

const DialogParamsParser = TemplateLiteralParser(
  DIALOG_ROUTE_PREFIX, RootId,
  '/', CustomId,
);

const DialogParamsEncoder = encodeSync(DialogParamsParser);
const DialogParamsDecoder = decodeSync(DialogParamsParser);

export const encodeDialogParams = (self: T): string => {
  return DialogParamsEncoder([
    DIALOG_ROUTE_PREFIX, self.root_id,
    '/', self.custom_id,
  ]);
};

export const decodeDialogParams = (encoded: string, request: any): T => {
  const [, root_id, , custom_id] = DialogParamsDecoder(encoded as never);

  return {
    _tag   : DIALOG_ROUTE_TAG,
    root_id,
    custom_id,
    message: MessageRoute.decodeMessageRouteFromRequest(request),
  };
};
