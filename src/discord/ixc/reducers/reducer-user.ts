import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {BackB, CloseB, NextB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {TimezoneButton, TimezoneS} from '#src/discord/ixc/components/components.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';
import {buildCustomId} from '#src/discord/ixc/store/id-build.ts';


const openUser = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'openUser',
        }),
        row1 : [TimezoneButton.as(AXN.USER_TIMEZONE_OPEN)],
        close: CloseB,
        back : BackB.as(AXN.LINKS_OPEN),
    };
}));

const startTimezone = buildReducer((s, ax) => E.gen(function * () {
    const selected = yield * S.encodeUnknown(S.TimeZone)(s.user!.timezone);

    return {
        ...s,
        info: jsonEmbed({
            type: 'startTimezone',
        }),
        selected: jsonEmbed({
            timezone: selected,
        }),
        row1  : [TimezoneS.as(AXN.USER_TIMEZONE_UPDATE).setDefaultValues([selected])],
        close : CloseB,
        back  : BackB.as(AXN.USER_OPEN),
        submit: SubmitB.as(AXN.NOOP, {disabled: true}),
    };
}));

const updateTimezone = buildReducer((s, ax) => E.gen(function * () {
    const selector = TimezoneS.fromMap(s.cmap)!;
    const selected = ax.selected[0].value;

    const submitId = buildCustomId({
        ...AXN.USER_TIMEZONE_SUBMIT.params,
        data: [selected],
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'updateTimezone',
        }),
        selected: jsonEmbed({
            timezone: selected,
        }),
        row1  : [selector.as(AXN.USER_TIMEZONE_UPDATE).setDefaultValues([selected])],
        close : CloseB,
        back  : BackB.as(AXN.USER_OPEN),
        submit: SubmitB.as(submitId, {disabled: false}),
    };
}));

const submitTimezone = buildReducer((s, ax) => E.gen(function * () {
    const selector = TimezoneS.fromMap(s.cmap)!;
    const selected = selector.getDefaultValues().map((o) => o.value);

    yield * putDiscordUser({
        ...s.user!,
        updated : new Date(Date.now()),
        timezone: yield * S.decodeUnknown(S.TimeZone)(selected[0]),
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'submitTimezone',
        }),
        selected: jsonEmbed({
            timezone: selected[0],
        }),
        status: jsonEmbed({
            success: `timezone updated to ${selected[0]}`,
        }),
        row1  : [selector.as(AXN.NOOP, {disabled: true})],
        close : CloseB,
        back  : BackB.as(AXN.USER_OPEN),
        submit: SubmitB.as(AXN.NOOP1, {disabled: true}),
        next  : NextB.as(AXN.LINKS_OPEN),
    };
}));


export const reducerUser = {
    [AXN.USER_OPEN.predicate]           : openUser,
    [AXN.USER_TIMEZONE_OPEN.predicate]  : startTimezone,
    [AXN.USER_TIMEZONE_UPDATE.predicate]: updateTimezone,
    [AXN.USER_TIMEZONE_SUBMIT.predicate]: submitTimezone,
};
