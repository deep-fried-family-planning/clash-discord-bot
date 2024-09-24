import type {COMMANDS} from '#src/discord/commands.ts';
import {api_coc} from '#src/lambdas/client-api-coc.ts';
import {getServerRecord, putServerRecord} from '#src/data-store/store-server.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';

export const oneofus = specCommand<typeof COMMANDS.ONE_OF_US>(async (body) => {
    const isValid = api_coc.util.isValidTag(body.data.options.player_tag.value);

    if (!isValid) {
        return [{
            desc: [
                'invalid player tag',
            ],
        }];
    }

    const serverRecord = await getServerRecord(body.guild_id);

    await putServerRecord({
        ...serverRecord,
        links: {
            ...serverRecord.links,
            [body.data.options.player_tag.value]: body.data.options.discord_user.value,
        },
    });

    return [{
        desc: [
            'player tag successfully linked',
        ],
    }];
});
