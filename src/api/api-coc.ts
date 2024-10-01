import {Client} from 'clashofclans.js';
import {SECRET_COC_KEY} from '#src/constants/secret-values.ts';

export const api_coc = new Client({baseURL: 'https://cocproxy.royaleapi.dev', keys: [SECRET_COC_KEY]});
