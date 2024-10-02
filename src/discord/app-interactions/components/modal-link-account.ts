import {CMP, CMP_T} from '#src/discord/helpers/re-exports.ts';
import {rEphemeralEmbed} from '#src/discord/helpers/response.ts';
import {api_coc} from '#src/https/api-coc.ts';
import {badRequest, notFound} from '@hapi/boom';
import {ddbGetPlayerLinks, ddbPutPlayerLinks} from '#src/database/codec/player-links-ddb.ts';
import {PLAYER_LINKS_CODEC_LATEST} from '#src/database/codec/player-links-codec.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {namedComponentOptions} from '#src/discord/helpers/named-options.ts';
import {MODAL} from '#src/discord/app-interactions/custom-id.ts';
import type {DModal, IModal} from '#src/discord/helpers/re-export-types.ts';

export const MODAL_LINK_ACCOUNT
    = {
        custom_id : MODAL.LINK_ACCOUNT,
        title     : 'Link Account',
        components: [{
            type      : CMP.ActionRow,
            components: [{
                type     : CMP.TextInput,
                style    : CMP_T.Short,
                custom_id: MODAL.LINK_ACCOUNT_TAG,
                label    : 'Player Tag',
                required : true,
            }],
        }, {
            type      : CMP.ActionRow,
            components: [{
                type     : CMP.TextInput,
                style    : CMP_T.Short,
                custom_id: MODAL.LINK_ACCOUNT_TOKEN,
                label    : 'API Token',
                required : true,
            }],
        }],
    } satisfies DModal;

export const modalLinkAccount = async (inter: IModal<typeof MODAL_LINK_ACCOUNT>) => {
    const options = namedComponentOptions(inter);

    const tag = api_coc.util.formatTag(options[MODAL.LINK_ACCOUNT_TAG].value);
    const token = options[MODAL.LINK_ACCOUNT_TOKEN].value;
    const user = inter.member!.user.id;

    if (!api_coc.util.isValidTag(tag)) {
        throw badRequest(`${tag} is not a valid player tag`);
    }

    const links = await ddbGetPlayerLinks();

    if (!links) {
        await ddbPutPlayerLinks({
            id      : 'player-links',
            version : PLAYER_LINKS_CODEC_LATEST,
            migrated: false,
            players : {},
            users   : {},
        });

        return rEphemeralEmbed({
            color      : nColor(COLOR.INFO),
            description: dLinesS(
                'links initialized for this environment, please run this command again.',
            ),
        });
    }

    const player = await api_coc.getPlayer(tag);
    const verified = await api_coc.verifyPlayerToken(tag, token);

    if (!verified) {
        throw notFound(`incorrect token for player tag ${tag} ${player.name}`);
    }

    await ddbPutPlayerLinks({
        ...links,
        players: {
            ...links.players,
            [tag]: {
                user,
                verified: 1,
            },
        },
    });

    return rEphemeralEmbed({
        color      : nColor(COLOR.SUCCESS),
        description: dLinesS(
            `player ${tag} ${player.name} successfully linked to <@${user}>`,
        ),
    });
};
