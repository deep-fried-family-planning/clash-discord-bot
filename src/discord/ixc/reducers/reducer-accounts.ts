import {E, ORD, pipe} from '#src/internal/pure/effect';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackButton, CloseButton, DeleteButton, ForwardButton, NextButton, SubmitButton} from '#src/discord/ixc/components/global-components.ts';
import {AccountSelector, AccountTypeSelector, ChangeAccountTypeButton, DeleteAccountButton} from '#src/discord/ixc/components/components.ts';
import {getDiscordPlayer, putDiscordPlayer, queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {buildCustomId} from '#src/discord/ixc/store/id.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {DELIM} from '#src/discord/ixc/store/id-routes.ts';
import type {MadeSelect} from '#src/discord/ixc/components/make-select.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import {Order} from 'effect';


const startAccounts = buildReducer((state, action) => E.gen(function * () {
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


const startSelectAccount = buildReducer((state, action) => E.gen(function * () {
    const records = pipe(
        yield * queryPlayersForUser({pk: state.user_id}),
        sortWithL((r) => r.sk, Order.string),
    );

    const players = pipe(
        yield * Clashofclans.getPlayers(records.map((r) => r.sk)),
        sortWithL((p) => p.tag, Order.string),
    );

    const together = zipL(records, players);

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
                    options: pipe(
                        together,
                        sortByL(
                            ORD.mapInput(ORD.string, ([r]) => r.account_type === 'main' ? '0' : r.account_type),
                            ORD.mapInput(ORD.reverse(ORD.number), ([, p]) => p.townHallLevel),
                            ORD.mapInput(ORD.string, ([, p]) => p.name),
                            ORD.mapInput(ORD.string, ([r]) => r.sk),
                        ),
                        mapL(([r, p]) => ({
                            label      : `[${r.account_type}/th${p.townHallLevel}]  ${p.name}`,
                            description: `tag: ${p.tag}, verification_level: ${r.verification}`,
                            value      : p.tag,
                        }))),
                })],
            ],
            close  : CloseButton,
            back   : BackButton.as(AXN.START_ACCOUNTS),
            forward: ForwardButton.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const updateSelectAccount = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountSelector.fromMap(state.cmap)!;

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
    const selector = AccountTypeSelector.fromMap(state.cmap)!;

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
    const selector = AccountTypeSelector.fromMap(state.cmap)!;

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


export const reducerAccounts = {
    [AXN.START_ACCOUNTS.predicate]: startAccounts,

    [AXN.START_SELECT_ACCOUNT.predicate] : startSelectAccount,
    [AXN.UPDATE_SELECT_ACCOUNT.predicate]: updateSelectAccount,

    [AXN.START_ACCOUNT_TYPE.predicate] : startAccountType,
    [AXN.UPDATE_ACCOUNT_TYPE.predicate]: updateAccountType,
    [AXN.SUBMIT_ACCOUNT_TYPE.predicate]: submitAccountType,

    [AXN.START_DELETE_ACCOUNT.predicate] : startDeleteAccount,
    [AXN.SUBMIT_DELETE_ACCOUNT.predicate]: submitDeleteAccount,
};
