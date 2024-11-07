import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {validateAdminRole} from '#src/discord/command-util/validate-admin-role.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {CMP} from '#src/discord/helpers/re-exports.ts';
import {BUTTON_LINK_ACCOUNT} from '#src/discord/app-interactions/components/button-link-account.ts';
import {createWarThreadWithExtraStuff} from '#src/discord/actions/create-war-thread-with-extra-stuff.ts';
import type {SMOKE} from '#src/discord/app-interactions/commands/smoke/smoke.cmd.ts';

export const smoke = specCommand<typeof SMOKE>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    validateAdminRole(server, body, 'must be admin role');

    await createWarThreadWithExtraStuff();

    return {
        embeds: [{
            color      : nColor(COLOR.BOT),
            description: JSON.stringify(server),
        }],
        components: [{
            type      : CMP.ActionRow,
            components: [
                BUTTON_LINK_ACCOUNT,
            ],
        }],
    };
});
