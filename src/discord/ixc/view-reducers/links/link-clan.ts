import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {BackB, ForwardB, NewB, SingleChannelS, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ClanTagT, LINK_CLAN_MODAL_OPEN, LINK_CLAN_MODAL_SUBMIT} from '#src/discord/ixc/modals/link-clan-modal.ts';
import {clanfam} from '#src/discord/ixs/link/clanfam.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {asFailure, asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';


const axn = {
    LINK_CLAN_TYPE_OPEN  : makeId(RDXK.OPEN, 'LCT'),
    LINK_CLAN_TYPE_UPDATE: makeId(RDXK.UPDATE, 'LCT'),
};


export const LinkClanB = NewB.as(axn.LINK_CLAN_TYPE_OPEN);
const ChannelS = SingleChannelS.as(axn.LINK_CLAN_TYPE_UPDATE, {
    placeholder: 'War Countdown Channel',
});
const TypeToModalB = SuccessB.as(LINK_CLAN_MODAL_OPEN, {
    label: 'Clan Tag',
});


const view1 = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Countdown = ChannelS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title      : 'Clan Link',
        description: unset,

        viewer: unset,
        editor: unset,
        status: unset,

        sel1: Countdown,
        row2: [
            EmbedEditorB.fwd(LinkClanB.id),
        ],

        forward: TypeToModalB.withData(Countdown.values).render({
            disabled: Countdown.values.length === 0,
        }),
        back: BackB.as(LinkB.id),
    };
}));


const view2 = typeRx((s, ax) => E.gen(function * () {
    const tag = ClanTagT.fromMap(ax.cmap);

    const Countdown = ChannelS.fromMap(s.cmap);

    const message = yield * clanfam(s.original, {
        clan     : tag?.component.value ?? '',
        countdown: Countdown.values[0],
    }).pipe(
        E.catchTag('DeepFryerSlashUserError', (e) => E.succeed({
            type  : 'ReturnableError',
            embeds: [{
                description: e.issue,
            }],
        })),
    );


    return {
        ...s,
        title      : 'Clan Link',
        description: unset,

        viewer: unset,
        editor: unset,
        status: 'type' in message
            ? asFailure(message.embeds[0])
            : asSuccess(message.embeds[0]),

        back: SuccessB.as(LinkClanB.id).render({
            label: 'type' in message
                ? 'Try Again'
                : 'Link',
        }),
        forward: ForwardB.as(LinkB.id),
    };
}));


export const linkClanReducer = {
    [LinkClanB.id.predicate]          : view1,
    [ChannelS.id.predicate]           : view1,
    [LINK_CLAN_MODAL_SUBMIT.predicate]: view2,
};
