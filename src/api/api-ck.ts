import {bindApiCall} from '#src/api/api-call.ts';

export const CK_URL = /* @__PURE__ */ 'https://api.clashking.xyz';

export const callClashKing = /* @__PURE__ */ bindApiCall(CK_URL);
