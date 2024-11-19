import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackB, CloseB} from '#src/discord/ixc/components/global-components.ts';
import {AccountTypeS, ApiMT, LinkMB, TagMT} from '#src/discord/ixc/components/components.ts';
import {oneofus} from '#src/discord/ixs/link/oneofus.ts';


const updateNewLinkType = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected[0].value;

    return {
        ...s,
        info: jsonEmbed({
            type: 'updateNewLinkType',
        }),
        sel1   : AccountTypeS.as(AXN.NLINK_UPDATE).setDefaultValues([selected]),
        close  : CloseB,
        forward: LinkMB.as(AXN.NLINK_MODAL_OPEN.withForward({forward: selected}), {disabled: false}),
        back   : BackB.as(AXN.LINKS_OPEN),
    };
}));


const submitLinkModal = typeRx((s, ax) => E.gen(function * () {
    const tag = TagMT.fromMap(ax.cmap)!;
    const api = ApiMT.fromMap(ax.cmap)!;
    const account_kind = ax.id.params.forward!;

    yield * CSL.debug('[ope]', tag, api, account_kind);

    const message = yield * oneofus(s.original, {
        player_tag  : tag.component.value!,
        api_token   : api.component.value!,
        account_kind: account_kind,
        discord_user: undefined,
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'submitLinkModal',
        }),
        status: message.embeds[0],
        back  : BackB.as(AXN.LINKS_OPEN),
        close : CloseB,
    };
}));


export const reducerNewLink = {
    [AXN.NLINK_UPDATE.predicate]      : updateNewLinkType,
    [AXN.NLINK_MODAL_SUBMIT.predicate]: submitLinkModal,
};
