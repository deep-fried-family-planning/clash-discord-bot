import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {BackB, NextB, SingleS, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ClanTagT, LINK_CLAN_MODAL_OPEN, LINK_CLAN_MODAL_SUBMIT} from '#src/discord/ixc/modals/link-clan-modal.ts';
import {clanfam} from '#src/discord/ixs/link/clanfam.ts';
import {ClanManageB} from '#src/discord/ixc/view-reducers/clans/clan-manage.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';


const axn = {
    LINK_CLAN_TYPE_OPEN  : makeId(RDXK.OPEN, 'LCT'),
    LINK_CLAN_TYPE_UPDATE: makeId(RDXK.UPDATE, 'LCT'),
};


export const LinkClanB = SuccessB.as(axn.LINK_CLAN_TYPE_OPEN, {
    label: 'Link Clan',
});
const ChannelS = SingleS.as(axn.LINK_CLAN_TYPE_UPDATE, {
    placeholder: 'War Countdown Channel',
    options    : [{
        label: 'NOOP',
        value: 'NOOP',
    }],
});
const TypeToModalB = SuccessB.as(LINK_CLAN_MODAL_OPEN, {
    label: 'Clan Tag',
});


const view1 = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Countdown = ChannelS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title: 'Link Clan',
        sel1 : Countdown,
        row2 : [
            EmbedEditorB.fwd(LinkClanB.id),
        ],
        forward: TypeToModalB.withData(Countdown.values).render({
            disabled: Countdown.values.length === 0,
        }),
        back: BackB.as(ClanManageB.id),
    };
}));


const view2 = typeRx((s, ax) => E.gen(function * () {
    const tag = ClanTagT.fromMap(ax.cmap);

    const message = yield * clanfam(s.original, {
        clan     : tag?.component.value ?? '',
        countdown: ax.id.params.data![0],
    });

    return {
        ...s,
        title      : 'Clan Linked',
        description: message.embeds[0].description,
        next       : NextB.as(ClanManageB.id),
    };
}));


export const linkClanReducer = {
    [LinkClanB.id.predicate]          : view1,
    [ChannelS.id.predicate]           : view1,
    [LINK_CLAN_MODAL_SUBMIT.predicate]: view2,
};
