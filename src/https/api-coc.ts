import {Client} from 'clashofclans.js';
import {SECRET} from '#src/internals/secrets.ts';

export const api_coc = /* @__PURE__ */ new Client({baseURL: 'https://cocproxy.royaleapi.dev', keys: [SECRET.COC_KEY]});
