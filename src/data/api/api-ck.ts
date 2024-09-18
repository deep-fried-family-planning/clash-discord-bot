import {bindApiCall} from '#src/api/api-call.ts';
import {CK_URL} from '#src/constants.ts';

export const callClashKing = bindApiCall(CK_URL);
