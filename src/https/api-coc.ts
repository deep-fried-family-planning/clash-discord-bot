import {Client} from 'clashofclans.js';
import {SECRET_COC_KEY} from '#src/constants/secrets/secret-coc-key.ts';

export const api_coc = /* @__PURE__ */ new Client({baseURL: 'https://cocproxy.royaleapi.dev', keys: [SECRET_COC_KEY]});
