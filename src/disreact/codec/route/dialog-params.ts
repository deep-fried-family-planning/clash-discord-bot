import {CustomId, RootId} from '#src/disreact/codec/constants/common.ts';
import {decodeSync, encodeSync, mutable, optional, type Schema, Struct, tag, TemplateLiteralParser} from 'effect/Schema';
import * as MessageRoute from './message-route.ts';



const DIALOG_ROUTE_TAG = 'DialogRoute';

export const DialogParams = mutable(Struct({
  _tag     : tag(DIALOG_ROUTE_TAG),
  root_id  : RootId,
  custom_id: CustomId,
  message  : optional(MessageRoute.MessageRoute),
}));

export const isDialogParams = (self: any): self is DialogParams => self._tag === DIALOG_ROUTE_TAG;

export type DialogParams = Schema.Type<typeof DialogParams>;

const DIALOG_ROUTE_PREFIX = '/dsx/';

const DialogParamsParser = TemplateLiteralParser(
  DIALOG_ROUTE_PREFIX, RootId,
  '/', CustomId,
);

const DialogParamsEncoder = encodeSync(DialogParamsParser);
const DialogParamsDecoder = decodeSync(DialogParamsParser);

export const encodeDialogParams = (self: DialogParams): string => {
  return DialogParamsEncoder([
    DIALOG_ROUTE_PREFIX, self.root_id,
    '/', self.custom_id,
  ]);
};

export const decodeDialogParams = (encoded: string, request: any): DialogParams => {
  const [, root_id, , custom_id] = DialogParamsDecoder(encoded as never);

  return {
    _tag   : DIALOG_ROUTE_TAG,
    root_id,
    custom_id,
    message: MessageRoute.decodeMessageRouteFromRequest(request),
  };
};
