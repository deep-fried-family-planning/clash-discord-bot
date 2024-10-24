import {ApplicationCommandOptionType} from '@discordjs/core/http-only';
import type {SubCommandSpec} from '#src/discord/types.ts';
import {OPTION_CLAN} from '#src/discord/command-pipeline/commands-options.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getAliasTag} from '#src/discord/command-util/get-alias-tag.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/helpers/markdown.ts';

export const CONFIG_SERVER_ADDCLAN = {
    name       : 'addclan',
    type       : ApplicationCommandOptionType.Subcommand,
    description: 'add your clan',
    options    : {
        ...OPTION_CLAN,
    },
} as const satisfies SubCommandSpec;

export const configServerAddclan = specCommand<typeof CONFIG_SERVER_ADDCLAN>(async (body) => {
    const tag = getAliasTag(body.data.options.clan.value);

    return {
        embeds: [{
            color      : nColor(COLOR.SUCCESS),
            description: dLinesS(
                tag,
            ),
        }],
    };
});
