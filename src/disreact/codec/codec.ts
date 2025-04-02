import {Root} from '#src/disreact/model/entity/root.ts'
import {E, S} from '#src/disreact/re-exports.ts'
import {Params} from './params'

export class Codec extends E.Service<Codec>()('disreact/codec', {
  succeed: {
    encodeRoot : Root.encodeRoot,
    encodeRoute: S.encodeUnknown(Params.MessageParamsToMessage),
    decodeRoute: S.decodeUnknown(Params.MessageParamsFromMessage),
  },
  accessors: true,
}) {}
