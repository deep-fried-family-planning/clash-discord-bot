import {E, S} from '#src/disreact/utils/re-exports.ts'
import {RxTx} from './rxtx'


const encodeResponse = S.encodeSync(RxTx.RouteEncoding)
const decodeRequest = S.decodeSync(RxTx.RouteDecoding)

export class RestCodec extends E.Service<RestCodec>()('disreact/RestCodec', {
  succeed: {
    encodeResponse,
    decodeRequest,
  },
}) {}
