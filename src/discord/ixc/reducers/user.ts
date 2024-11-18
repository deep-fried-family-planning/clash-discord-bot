import {AXN} from '#src/discord/ixc/reducers/ax.ts';
import {buildReducer} from '#src/discord/ixc/store/build-reducer.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {BackButton, CloseButton, NextButton, SubmitButton} from '#src/discord/ixc/components/global-components.ts';
import {TimezoneButton, TimezoneSelector} from '#src/discord/ixc/components/components.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {buildCustomId} from '#src/discord/ixc/store/id.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';


const openUser = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [TimezoneButton.as(AXN.START_TIMEZONE)],
            ],
            close: CloseButton,
            back : BackButton.as(AXN.START_LINKS),
        },
    };
}));

const startTimezone = buildReducer((state, action) => E.gen(function * () {
    const selected = yield * S.encodeUnknown(S.TimeZone)(state.user.timezone);

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                timezone: selected,
            }),
            rows: [
                [TimezoneSelector.as(AXN.UPDATE_TIMEZONE).setDefaultValues([selected])],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.OPEN_USER),
            submit: SubmitButton.as(AXN.NOOP, {disabled: true}),
        },
    };
}));

const updateTimezone = buildReducer((state, action) => E.gen(function * () {
    const selector = TimezoneSelector.fromMap(state.componentMap)!;
    const selected = action.selected[0].value;

    const submitId = buildCustomId({
        ...AXN.SUBMIT_TIMEZONE.params,
        data: [selected],
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                timezone: selected,
            }),
            rows: [
                [selector.as(AXN.UPDATE_TIMEZONE).setDefaultValues([selected])],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.OPEN_USER),
            submit: SubmitButton.as(submitId, {disabled: false}),
        },
    };
}));

const submitTimezone = buildReducer((state, action) => E.gen(function * () {
    const selector = TimezoneSelector.fromMap(state.componentMap)!;
    const selected = selector.getDefaultValues().map((o) => o.value);

    yield * putDiscordUser({
        ...state.user,
        updated : new Date(Date.now()),
        timezone: yield * S.decodeUnknown(S.TimeZone)(selected[0]),
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                timezone: selected[0],
            }),
            status: jsonEmbed({
                success: `timezone updated to ${selected[0]}`,
            }),
            rows: [
                [selector.as(AXN.NOOP, {disabled: true})],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.OPEN_USER),
            submit: SubmitButton.as(AXN.NOOP1, {disabled: true}),
            next  : NextButton.as(AXN.START_LINKS),
        },
    };
}));


export const userReducer = {
    [AXN.OPEN_USER.predicate]      : openUser,
    [AXN.START_TIMEZONE.predicate] : startTimezone,
    [AXN.UPDATE_TIMEZONE.predicate]: updateTimezone,
    [AXN.SUBMIT_TIMEZONE.predicate]: submitTimezone,
};
