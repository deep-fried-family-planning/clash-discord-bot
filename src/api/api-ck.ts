import {bindApiCall} from '#src/api/api-call.ts';

export const CK_URL = 'https://api.clashking.xyz';

export const callClashKing = bindApiCall(CK_URL);
