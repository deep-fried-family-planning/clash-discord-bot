import {getSecret} from '#src/lambdas/client-aws.ts';
import {api_coc} from '#src/lambdas/client-api-coc.ts';
import {initDiscord} from '#src/discord/api/api-discord.ts';
import {getAliasTag} from '#src/discord/command-util/get-alias-tag.ts';
import * as console from 'node:console';

describe('test', () => {
    it('does the thing', async () => {
        const email = await getSecret('COC_USER');
        const password = await getSecret('COC_PASSWORD');

        await api_coc.login({
            email,
            password,
            keyName: `local-app-discord`,
        });

        const clanTag = getAliasTag();

        const cwl = await api_coc.getClanWarLeagueGroup(clanTag);

        const cids = cwl.clans.map((c) => c.tag);

        const pids = cwl.clans.flatMap((c) => c.members.map((m) => m.tag));
    });
});
