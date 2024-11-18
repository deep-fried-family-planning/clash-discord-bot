import {buildReducer} from '#src/discord/ixc/store/build-reducer.ts';
import {E, pipe, S} from '#src/internal/pure/effect.ts';
import {QuietEndSelector, QuietStartSelector, TimezoneSelector} from '#src/discord/ixc/components/components.ts';
import {buildCustomId} from '#src/discord/ixc/store/id.ts';
import {AXN, AXN_FIRST} from '#src/discord/ixc/reducers/ax.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackButton, CloseButton, SubmitButton} from '#src/discord/ixc/components/global-components.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';
import {flatMapL, mapL} from '#src/internal/pure/pure-list.ts';


export const firstUser = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed({
                message: 'first time user detected',
            }),
            rows: [
                [TimezoneSelector.as(AXN_FIRST.FIRST_UPDATE_TIMEZONE)],
                [QuietStartSelector.as(AXN_FIRST.FIRST_UPDATE_QUIET_START)],
                [QuietEndSelector.as(AXN_FIRST.FIRST_UPDATE_QUIET_END)],
            ],
            close : CloseButton,
            submit: SubmitButton.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const firstUserUpdate = buildReducer((state, action) => E.gen(function * () {
    const selectors = pipe(
        [
            TimezoneSelector.as(AXN_FIRST.FIRST_UPDATE_TIMEZONE).fromMap(state.componentMap)!,
            QuietStartSelector.as(AXN_FIRST.FIRST_UPDATE_QUIET_START).fromMap(state.componentMap)!,
            QuietEndSelector.as(AXN_FIRST.FIRST_UPDATE_QUIET_END).fromMap(state.componentMap)!,
        ],
        mapL((selector) => {
            if (selector.id.predicate === action.id.predicate) {
                return selector.setDefaultValues([action.selected[0].value]);
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
        ...AXN_FIRST.FIRST_USER_SUBMIT.params,
        data: selected,
    });


    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                timezone  : selected[0],
                quietStart: selected[1],
                quietEnd  : selected[2],
            }),
            rows  : pipe(selectors, mapL((s) => [s])),
            close : CloseButton,
            submit: SubmitButton.as(submitId, {disabled: selected.length !== 3}),
        },
    };
}));


const firstUserSubmit = buildReducer((state, action) => E.gen(function * () {
    const [
        timezone,
        quietStart,
        quietEnd,
    ] = pipe(
        [
            TimezoneSelector.as(AXN_FIRST.FIRST_UPDATE_TIMEZONE).fromMap(state.componentMap)!,
            QuietStartSelector.as(AXN_FIRST.FIRST_UPDATE_QUIET_START).fromMap(state.componentMap)!,
            QuietEndSelector.as(AXN_FIRST.FIRST_UPDATE_QUIET_END).fromMap(state.componentMap)!,
        ] as const,
        mapL((selector) => selector.getDefaultValues()),
    );


    yield * putDiscordUser({
        type           : 'DiscordUser',
        pk             : state.user_id,
        sk             : 'now',
        gsi_all_user_id: state.user_id,
        version        : '1.0.0',
        created        : new Date(Date.now()),
        updated        : new Date(Date.now()),
        timezone       : yield * S.decodeUnknown(S.TimeZone)(timezone[0].value),
        quiet          : `${quietStart[0].value}-${quietEnd[0].value}`,
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                timezone  : timezone[0].value,
                quietStart: quietStart[0].value,
                quietEnd  : quietEnd[0].value,
            }),
            status: jsonEmbed({
                success: `user record created with ${timezone[0].value} (${quietStart[0].value}-${quietEnd[0].value})`,
            }),
            rows: [
                [TimezoneSelector.as(AXN.NOOP, {disabled: true})],
                [QuietStartSelector.as(AXN.NOOP1, {disabled: true})],
                [QuietEndSelector.as(AXN.NOOP2, {disabled: true})],
            ],
            close : CloseButton,
            submit: SubmitButton.as(AXN.NOOP3, {disabled: true}),
        },
    };
}));


export const firstReducer = {
    [AXN_FIRST.FIRST_USER.predicate]              : firstUser,
    [AXN_FIRST.FIRST_UPDATE_TIMEZONE.predicate]   : firstUserUpdate,
    [AXN_FIRST.FIRST_UPDATE_QUIET_START.predicate]: firstUserUpdate,
    [AXN_FIRST.FIRST_UPDATE_QUIET_END.predicate]  : firstUserUpdate,
    [AXN_FIRST.FIRST_USER_SUBMIT.predicate]       : firstUserSubmit,
};
