import {Client} from 'clashofclans.js';
import {getSecret} from '#src/lambdas/client-aws.ts';
import {COC_KEY} from '#src/constants-secrets.ts';

const key = await getSecret(COC_KEY);

export const api_coc = new Client({baseURL: 'https://cocproxy.royaleapi.dev', keys: [key]});
