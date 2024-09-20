import {buildCommand} from '#src/discord/types.ts';
import {COMMANDS} from '#src/discord/commands.ts';
import {getServerRecord, putServerRecord} from '#src/data/store/store-server.ts';
import {api_coc} from '#src/lambdas/client-api-coc.ts';

export const oneofus = buildCommand(COMMANDS.ONE_OF_US, async (body) => {
    const isValid = api_coc.util.isValidTag(body.data.options.player_tag);

    if (!isValid) {
        return [{
            desc: [
                'invalid player tag',
            ],
        }];
    }

    const serverRecord = await getServerRecord(body.guild_id!);

    await putServerRecord({
        ...serverRecord,
        links: {
            ...serverRecord.links,
            [body.data.options.player_tag]: body.data.options.discord_user,
        },
    });

    return [{
        desc: [
            'test',
        ],
    }];
});
