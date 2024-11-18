import {E} from '#src/internal/pure/effect';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {
    BackButton,
    CloseButton, DeleteButton,
    ForwardButton,
    NextButton,
    SubmitButton,
} from '#src/discord/ixc/components/global-components.ts';
import {
    AccountsButton,
    AccountSelector,
    AccountTypeSelector,
    ChangeAccountTypeButton,
    DeleteAccountButton,
    NewLinkButton,
    UserButton,
} from '#src/discord/ixc/components/components.ts';
import {getDiscordPlayer, putDiscordPlayer, queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {buildReducer} from '#src/discord/ixc/store/build-reducer.ts';
import type {MadeSelect} from '#src/discord/ixc/components/make-components.ts';
import {buildCustomId} from '#src/discord/ixc/store/id.ts';
import {AXN} from '#src/discord/ixc/reducers/ax.ts';
import {DELIM} from '#src/discord/ixc/store/id-routes.ts';
import {userReducer} from '#src/discord/ixc/reducers/user.ts';
import {firstReducer, firstUser} from '#src/discord/ixc/reducers/first.ts';


const actionEntryLinks = buildReducer((state, action) => E.gen(function * () {
    // if (!state.user) {
    //     return yield * firstUser(state, action);
    // }

    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [
                    NewLinkButton.as(AXN.START_NEW_LINK),
                    AccountsButton.as(AXN.START_ACCOUNTS),
                    UserButton.as(AXN.OPEN_USER),
                ],
            ],
            close: CloseButton,
        },
    };
}));


const actionNewLinks = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info : jsonEmbed(action),
            close: CloseButton,
            back : BackButton.as(AXN.START_LINKS),
        },
    };
}));


const actionAccounts = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [
                    ChangeAccountTypeButton.as(AXN.START_SELECT_ACCOUNT.withForward({
                        nextKind: AXN.START_ACCOUNT_TYPE.params.kind,
                        nextType: AXN.START_ACCOUNT_TYPE.params.type!,
                    })),
                    DeleteAccountButton.as(AXN.START_SELECT_ACCOUNT.withForward({
                        nextKind: AXN.START_DELETE_ACCOUNT.params.kind,
                        nextType: AXN.START_DELETE_ACCOUNT.params.type!,
                    })),
                ],
            ],
            close: CloseButton,
            back : BackButton.as(AXN.START_LINKS),
        },
    };
}));


const actionInitSelectAccount = buildReducer((state, action) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: state.user_id});
    const players = yield * Clashofclans.getPlayers(records.map((r) => r.sk));

    const lookup = players.reduce(
        (acc, player) => {
            acc[player.tag] = player;
            return acc;
        },
        emptyKV<string, typeof players[number]>(),
    );

    const forwardId = AXN.UPDATE_SELECT_ACCOUNT.withForward({
        nextKind: action.id.params.nextKind!,
        nextType: action.id.params.nextType!,
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                playerTag: 'not selected',
            }),
            rows: [
                [AccountSelector.as(forwardId, {
                    options: records.map((r) => ({
                        label      : `${lookup[r.sk].name} (${r.account_type})`,
                        description: `[th${lookup[r.sk].townHallLevel}]: ${r.sk}`,
                        value      : lookup[r.sk].tag,
                    })),
                })],
            ],
            close  : CloseButton,
            back   : BackButton.as(AXN.START_ACCOUNTS),
            forward: ForwardButton.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const updateSelectAccount = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountSelector.fromMap(state.componentMap)!;

    const forward = buildCustomId({
        kind   : action.id.params.nextKind!,
        type   : action.id.params.nextType!,
        forward: action.selected[0].value,
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                playerTag: action.selected[0].value,
            }),
            rows: [
                [selector.as(action.id, {
                    options: selector.component.options!.map((o) => ({
                        ...o,
                        default: action.selected.map((s) => s.value).includes(o.value),
                    })),
                })],
            ],
            close  : CloseButton,
            back   : BackButton.as(AXN.START_ACCOUNTS),
            forward: ForwardButton.as(forward, {disabled: false}),
        },
    };
}));


const startAccountType = buildReducer((state, action) => E.gen(function * () {
    const playerTag = action.forward;

    const record = yield * getDiscordPlayer({pk: state.user_id, sk: playerTag!});

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                playerTag,
                accountType: record.account_type,
            }),
            rows: [
                [AccountTypeSelector.as(AXN.UPDATE_ACCOUNT_TYPE, {
                    options: AccountTypeSelector.options.options!.map((o) => ({
                        ...o,
                        value  : [playerTag, o.value].join(DELIM.DATA),
                        default: o.value === record.account_type,
                    })),
                })],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.START_ACCOUNTS),
            submit: SubmitButton.as(AXN.NOOP, {disabled: true}),
        },
    };
}));
const updateAccountType = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountTypeSelector.fromMap(state.componentMap)!;

    const submission = buildCustomId({
        ...AXN.SUBMIT_ACCOUNT_TYPE.params,
        data: [action.selected[0].value],
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: jsonEmbed({
                ...JSON.parse(state.view!.selected!.description!),
                accountType: action.selected[0].value,
            }),
            rows: [
                [selector.as(action.id, {
                    options: selector.component.options!.map((o) => ({
                        ...o,
                        default: action.selected.map((s) => s.value).includes(o.value),
                    })),
                })],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.START_ACCOUNTS),
            submit: SubmitButton.as(submission, {disabled: false}),
        },
    };
}));
const submitAccountType = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountTypeSelector.fromMap(state.componentMap)!;

    const [playerTag, accountType] = action.id.params.data!;

    const record = yield * getDiscordPlayer({pk: state.user_id, sk: playerTag});
    yield * putDiscordPlayer({
        ...record,
        updated     : new Date(Date.now()),
        account_type: accountType,
    });

    return {
        ...state,
        view: {
            info    : jsonEmbed(action),
            selected: state.view!.selected!,
            status  : jsonEmbed({
                success: `${playerTag} updated to ${accountType}`,
            }),
            rows: [
                [selector.as(AXN.NOOP, {disabled: true})],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.START_ACCOUNTS),
            submit: SubmitButton.as(AXN.NOOP1, {disabled: true}),
            next  : NextButton.as(AXN.START_LINKS),
        },
    };
}));


const startDeleteAccount = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [AccountTypeSelector.as(AXN.UPDATE_ACCOUNT_TYPE)],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.START_ACCOUNTS),
            submit: DeleteButton.as(AXN.SUBMIT_ACCOUNT_TYPE, {disabled: true}),
        },
    };
}));
const submitDeleteAccount = buildReducer((state, action) => E.gen(function * () {
    const [[selector]] = state.view!.rows! as [[MadeSelect]];

    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [selector.as(action.id, {
                    ...selector.component,
                    options: selector.component.options!.map((o) => ({
                        ...o,
                        default: action.selected.map((s) => s.value).includes(o.value),
                    })),
                })],
            ],
            close : CloseButton,
            back  : BackButton.as(AXN.START_ACCOUNTS),
            submit: SubmitButton.as(AXN.SUBMIT_ACCOUNT_TYPE, {disabled: true}),
        },
    };
}));


export const IXCD_ACTIONS = {
    [AXN.ENTRY_LINKS.predicate]: actionEntryLinks,
    [AXN.START_LINKS.predicate]: actionEntryLinks,

    ...firstReducer,
    ...userReducer,

    [AXN.START_NEW_LINK.predicate]: actionNewLinks,


    [AXN.START_ACCOUNTS.predicate]: actionAccounts,

    [AXN.START_SELECT_ACCOUNT.predicate] : actionInitSelectAccount,
    [AXN.UPDATE_SELECT_ACCOUNT.predicate]: updateSelectAccount,

    [AXN.START_ACCOUNT_TYPE.predicate] : startAccountType,
    [AXN.UPDATE_ACCOUNT_TYPE.predicate]: updateAccountType,
    [AXN.SUBMIT_ACCOUNT_TYPE.predicate]: submitAccountType,

    [AXN.START_DELETE_ACCOUNT.predicate] : startDeleteAccount,
    [AXN.SUBMIT_DELETE_ACCOUNT.predicate]: submitDeleteAccount,

};
