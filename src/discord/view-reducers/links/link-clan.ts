import {makeId} from '#src/discord/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {BackB, ForwardB, NewB, SingleChannelS, SuccessB} from '#src/discord/components/global-components.ts';
import {ClanTagT, LINK_CLAN_MODAL_OPEN, LINK_CLAN_MODAL_SUBMIT} from '#src/discord/modals/link-clan-modal.ts';
import {clanfam} from '#src/discord/commands/link/clanfam.ts';
import {EmbedEditorB} from '#src/discord/view-reducers/editors/embed-editor.ts';
import {LinkB} from '#src/discord/view-reducers/omni-board.ts';
import {asFailure, asSuccess, unset} from '#src/discord/components/component-utils.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {LABEL_CLAN_LINK, LABEL_CLAN_TAG} from '#src/internal/constants/label.ts';
import {PLACEHOLDER_WAR_COUNTDOWN} from '#src/internal/constants/placeholder.ts';


export const LinkClanB = NewB.as(makeId(RK_OPEN, 'LCT'));
const ChannelS = SingleChannelS.as(makeId(RK_UPDATE, 'LCT'), {
    placeholder: PLACEHOLDER_WAR_COUNTDOWN,
});
const TypeToModalB = SuccessB.as(LINK_CLAN_MODAL_OPEN, {
    label: LABEL_CLAN_TAG,
});


const view1 = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Countdown = ChannelS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title      : LABEL_CLAN_LINK,
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
    } satisfies St;
});


const view2 = (s: St, ax: Ax) => E.gen(function * () {
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
    } satisfies St;
});


export const linkClanReducer = {
    [LinkClanB.id.predicate]          : view1,
    [ChannelS.id.predicate]           : view1,
    [LINK_CLAN_MODAL_SUBMIT.predicate]: view2,
};
