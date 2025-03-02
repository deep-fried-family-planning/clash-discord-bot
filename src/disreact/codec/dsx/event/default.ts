import {S} from '#src/internal/pure/effect.ts';
import {_Tag} from '#src/disreact/codec/common/index.ts';



export const TAG_DIALOG = _Tag.DIALOG;

export const DialogFields = S.Struct({
  _kind    : S.tag(TAG_DIALOG),
  request  : S.Any,
  custom_id: S.String,
}).fields;



export const TAG_MESSAGE = _Tag.MESSAGE;

export const MessageFields = S.Struct({
  _kind    : S.tag(TAG_MESSAGE),
  request  : S.Any,
  custom_id: S.String,
}).fields;
