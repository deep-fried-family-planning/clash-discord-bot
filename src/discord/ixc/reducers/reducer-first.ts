import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E, pipe, S} from '#src/internal/pure/effect.ts';
import {QuietEndSelector, QuietStartSelector, TimezoneS} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {CloseB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';
import {flatMapL, mapL} from '#src/internal/pure/pure-list.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';


export const firstUser = typeRx((s) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            message: 'first time user detected',
        }),
        sel1  : TimezoneS.as(AXN.FU_TZ_UPDATE),
        sel2  : QuietStartSelector.as(AXN.FU_QH_UPDATE),
        sel3  : QuietEndSelector.as(AXN.FU_QE_UPDATE),
        submit: SubmitB.as(AXN.NOOP, {disabled: true}),
    };
}));


const firstUserUpdate = typeRx((s, ax) => E.gen(function * () {
    const selectors = pipe(
        [
            TimezoneS.as(AXN.FU_TZ_UPDATE).fromMap(s.cmap)!,
            QuietStartSelector.as(AXN.FU_QH_UPDATE).fromMap(s.cmap)!,
            QuietEndSelector.as(AXN.FU_QE_UPDATE).fromMap(s.cmap)!,
        ],
        mapL((selector) => {
            if (selector.id.predicate === ax.id.predicate) {
                return selector.setDefaultValues([ax.selected[0].value]);
            }
            return selector;
        }),
    );

    const selected = pipe(
        selectors,
        flatMapL((selector) => pipe(
            selector.getDefaultValues(),
            mapL((v) => v.value),
        )),
    );

    const submitId = toId({
        ...AXN.FU_SUBMIT.params,
        data: selected,
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'firstUserUpdate',
        }),
        selected: jsonEmbed({
            timezone  : selected[0],
            quietStart: selected[1],
            quietEnd  : selected[2],
        }),
        sel1  : selectors[0],
        sel2  : selectors[1],
        sel3  : selectors[2],
        close : CloseB,
        submit: SubmitB.as(submitId, {disabled: selected.length !== 3}),
    };
}));


const firstUserSubmit = typeRx((s, ax) => E.gen(function * () {
    const [
        timezone,
        quietStart,
        quietEnd,
    ] = pipe(
        [
            TimezoneS.as(AXN.FU_TZ_UPDATE).fromMap(s.cmap)!,
            QuietStartSelector.as(AXN.FU_QH_UPDATE).fromMap(s.cmap)!,
            QuietEndSelector.as(AXN.FU_QE_UPDATE).fromMap(s.cmap)!,
        ] as const,
        mapL((selector) => selector.getDefaultValues()),
    );


    yield * putDiscordUser({
        type           : 'DiscordUser',
        pk             : s.user_id,
        sk             : 'now',
        gsi_all_user_id: s.user_id,
        version        : '1.0.0',
        created        : new Date(Date.now()),
        ...s.user,
        updated        : new Date(Date.now()),
        timezone       : yield * S.decodeUnknown(S.TimeZone)(timezone[0].value),
        quiet          : `${quietStart[0].value}-${quietEnd[0].value}`,
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'firstUserSubmit',
        }),
        selected: jsonEmbed({
            timezone  : timezone[0].value,
            quietStart: quietStart[0].value,
            quietEnd  : quietEnd[0].value,
        }),
        status: jsonEmbed({
            success: `user record created with ${timezone[0].value} (${quietStart[0].value}-${quietEnd[0].value})`,
        }),
        sel1  : TimezoneS.as(AXN.NOOP, {disabled: true}),
        sel2  : QuietStartSelector.as(AXN.NOOP1, {disabled: true}),
        sel3  : QuietEndSelector.as(AXN.NOOP2, {disabled: true}),
        close : CloseB,
        submit: SubmitB.as(AXN.NOOP3, {disabled: true}),
    };
}));


export const reducerFirst = {
    [AXN.FU_OPEN.predicate]     : firstUser,
    [AXN.FU_TZ_UPDATE.predicate]: firstUserUpdate,
    [AXN.FU_QH_UPDATE.predicate]: firstUserUpdate,
    [AXN.FU_QE_UPDATE.predicate]: firstUserUpdate,
    [AXN.FU_SUBMIT.predicate]   : firstUserSubmit,
};
