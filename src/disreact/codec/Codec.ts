import {Root} from '#src/disreact/model/entity/root.ts'
import {E, S} from '#src/disreact/utils/re-exports.ts'
import {Params} from '#src/disreact/codec/params.ts'

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  succeed: {
    encodeRoot : Root.encodeRoot,
    encodeRoute: S.encodeUnknown(Params.MessageParamsToMessage),
    decodeRoute: S.decodeUnknown(Params.MessageParamsFromMessage),
  },
  accessors: true,
}) {}
