import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {BackB, CloseB, NextB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {TimezoneButton, TimezoneS} from '#src/discord/ixc/components/components.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';


const openUser = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'openUser',
        }),
        row1 : [TimezoneButton.as(AXN.USER_TZ_OPEN)],
        close: CloseB,
        back : BackB.as(AXN.LINKS_OPEN),
    };
}));

const startTimezone = typeRx((s, ax) => E.gen(function * () {
    const selected = yield * S.encodeUnknown(S.TimeZone)(s.user!.timezone);

    return {
        ...s,
        info: jsonEmbed({
            type: 'startTimezone',
        }),
        selected: jsonEmbed({
            timezone: selected,
        }),
        sel1  : TimezoneS.as(AXN.USER_TZ_UPDATE).setDefaultValues([selected]),
        close : CloseB,
        back  : BackB.as(AXN.USER_OPEN),
        submit: SubmitB.as(AXN.NOOP, {disabled: true}),
    };
}));

const updateTimezone = typeRx((s, ax) => E.gen(function * () {
    const selector = TimezoneS.fromMap(s.cmap)!;
    const selected = ax.selected[0].value;

    const submitId = toId({
        ...AXN.USER_TZ_SUBMIT.params,
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
        sel1  : selector.as(AXN.USER_TZ_UPDATE).setDefaultValues([selected]),
        close : CloseB,
        back  : BackB.as(AXN.USER_OPEN),
        submit: SubmitB.as(submitId, {disabled: false}),
    };
}));

const submitTimezone = typeRx((s, ax) => E.gen(function * () {
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
        sel1  : selector.as(AXN.NOOP, {disabled: true}),
        back  : BackB.as(AXN.USER_OPEN),
        submit: SubmitB.as(AXN.NOOP1, {disabled: true}),
        next  : NextB.as(AXN.LINKS_OPEN),
    };
}));


export const reducerUser = {
    [AXN.USER_OPEN.predicate]     : openUser,
    [AXN.USER_TZ_OPEN.predicate]  : startTimezone,
    [AXN.USER_TZ_UPDATE.predicate]: updateTimezone,
    [AXN.USER_TZ_SUBMIT.predicate]: submitTimezone,
};
