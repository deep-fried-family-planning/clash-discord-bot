import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E, pipe, S} from '#src/internal/pure/effect.ts';
import {QuietEndSelector, QuietStartSelector, TimezoneS} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {CloseB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';
import {flatMapL, mapL} from '#src/internal/pure/pure-list.ts';
import {buildCustomId} from '#src/discord/ixc/store/id-build.ts';


export const firstUser = buildReducer((s) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            message: 'first time user detected',
        }),
        row1  : [TimezoneS.as(AXN.FIRST_UPDATE_TIMEZONE)],
        row2  : [QuietStartSelector.as(AXN.FIRST_UPDATE_QUIET_START)],
        row3  : [QuietEndSelector.as(AXN.FIRST_UPDATE_QUIET_END)],
        close : CloseB,
        submit: SubmitB.as(AXN.NOOP, {disabled: true}),
    };
}));


const firstUserUpdate = buildReducer((s, ax) => E.gen(function * () {
    const selectors = pipe(
        [
            TimezoneS.as(AXN.FIRST_UPDATE_TIMEZONE).fromMap(s.cmap)!,
            QuietStartSelector.as(AXN.FIRST_UPDATE_QUIET_START).fromMap(s.cmap)!,
            QuietEndSelector.as(AXN.FIRST_UPDATE_QUIET_END).fromMap(s.cmap)!,
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

    const submitId = buildCustomId({
        ...AXN.FIRST_USER_SUBMIT.params,
        data: selected,
    });

    const returnable = pipe(selectors, mapL((s) => [s]));

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
        row1  : returnable[0],
        row2  : returnable[1],
        row3  : returnable[2],
        close : CloseB,
        submit: SubmitB.as(submitId, {disabled: selected.length !== 3}),
    };
}));


const firstUserSubmit = buildReducer((s, ax) => E.gen(function * () {
    const [
        timezone,
        quietStart,
        quietEnd,
    ] = pipe(
        [
            TimezoneS.as(AXN.FIRST_UPDATE_TIMEZONE).fromMap(s.cmap)!,
            QuietStartSelector.as(AXN.FIRST_UPDATE_QUIET_START).fromMap(s.cmap)!,
            QuietEndSelector.as(AXN.FIRST_UPDATE_QUIET_END).fromMap(s.cmap)!,
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
        row1  : [TimezoneS.as(AXN.NOOP, {disabled: true})],
        row2  : [QuietStartSelector.as(AXN.NOOP1, {disabled: true})],
        row3  : [QuietEndSelector.as(AXN.NOOP2, {disabled: true})],
        close : CloseB,
        submit: SubmitB.as(AXN.NOOP3, {disabled: true}),
    };
}));


export const reducerFirst = {
    [AXN.FIRST_USER.predicate]              : firstUser,
    [AXN.FIRST_UPDATE_TIMEZONE.predicate]   : firstUserUpdate,
    [AXN.FIRST_UPDATE_QUIET_START.predicate]: firstUserUpdate,
    [AXN.FIRST_UPDATE_QUIET_END.predicate]  : firstUserUpdate,
    [AXN.FIRST_USER_SUBMIT.predicate]       : firstUserSubmit,
};
