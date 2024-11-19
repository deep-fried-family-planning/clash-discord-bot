import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackB, CloseB} from '#src/discord/ixc/components/global-components.ts';
import {AccountTypeS, ApiMT, LinkMB, TagMT} from '#src/discord/ixc/components/components.ts';
import {oneofus} from '#src/discord/ixs/link/oneofus.ts';


const actionNewLinks = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'actionNewLinks',
        }),
        row1   : [AccountTypeS.as(AXN.NEW_LINK_UPDATE)],
        close  : CloseB,
        forward: LinkMB.as(AXN.NOOP, {disabled: true}),
        back   : BackB.as(AXN.LINKS_OPEN),
    };
}));


const updateNewLinkType = buildReducer((s, ax) => E.gen(function * () {
    const selected = ax.selected[0].value;

    return {
        ...s,
        info: jsonEmbed({
            type: 'updateNewLinkType',
        }),
        row1   : [AccountTypeS.as(AXN.NEW_LINK_UPDATE).setDefaultValues([selected])],
        close  : CloseB,
        forward: LinkMB.as(AXN.NEW_LINK_MODAL_OPEN.withForward({forward: selected}), {disabled: false}),
        back   : BackB.as(AXN.LINKS_OPEN),
    };
}));


const submitLinkModal = buildReducer((s, ax) => E.gen(function * () {
    const tag = TagMT.fromMap(ax.cmap!)!;
    const api = ApiMT.fromMap(ax.cmap!)!;
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
    [AXN.NEW_LINK_OPEN.predicate]        : actionNewLinks,
    [AXN.NEW_LINK_UPDATE.predicate]      : updateNewLinkType,
    [AXN.NEW_LINK_MODAL_SUBMIT.predicate]: submitLinkModal,
};
