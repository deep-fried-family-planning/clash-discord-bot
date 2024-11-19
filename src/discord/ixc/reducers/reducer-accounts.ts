import {E, ORD, pipe} from '#src/internal/pure/effect';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackB, CloseB, DeleteB, ForwardB, NextB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {AccountS, AccountTypeS, ChangeAccountTypeButton, DeleteAccountButton} from '#src/discord/ixc/components/components.ts';
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
            info: jsonEmbed({
                type: 'startAccounts',
            }),
            rows: [
                [
                    ChangeAccountTypeButton.as(AXN.ACCOUNTS_SELECT.withForward({
                        nextKind: AXN.ACCOUNT_TYPE_OPEN.params.kind,
                        nextType: AXN.ACCOUNT_TYPE_OPEN.params.type!,
                    })),
                    DeleteAccountButton.as(AXN.ACCOUNTS_SELECT.withForward({
                        nextKind: AXN.ACCOUNT_DELETE_OPEN.params.kind,
                        nextType: AXN.ACCOUNT_DELETE_OPEN.params.type!,
                    })),
                ],
            ],
            close: CloseB,
            back : BackB.as(AXN.LINKS_OPEN),
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

    const forwardId = AXN.ACCOUNTS_SELECT_UPDATE.withForward({
        nextKind: action.id.params.nextKind!,
        nextType: action.id.params.nextType!,
    });

    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'startSelectAccount',
            }),
            selected: jsonEmbed({
                playerTag: 'not selected',
            }),
            rows: [
                [AccountS.as(forwardId, {
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
                        })),
                    ),
                })],
            ],
            close  : CloseB,
            back   : BackB.as(AXN.ACCOUNTS_OPEN),
            forward: ForwardB.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const updateSelectAccount = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountS.fromMap(state.cmap)!;

    const forward = buildCustomId({
        kind   : action.id.params.nextKind!,
        type   : action.id.params.nextType!,
        forward: action.selected[0].value,
    });

    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'updateSelectAccount',
            }),
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
            close  : CloseB,
            back   : BackB.as(AXN.ACCOUNTS_OPEN),
            forward: ForwardB.as(forward, {disabled: false}),
        },
    };
}));


const startAccountType = buildReducer((state, action) => E.gen(function * () {
    const playerTag = action.forward;

    const record = yield * getDiscordPlayer({pk: state.user_id, sk: playerTag!});

    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'startAccountType',
            }),
            selected: jsonEmbed({
                playerTag,
                accountType: record.account_type,
            }),
            rows: [
                [AccountTypeS.as(AXN.ACCOUNT_TYPE_UPDATE, {
                    options: AccountTypeS.options.options!.map((o) => ({
                        ...o,
                        value  : [playerTag, o.value].join(DELIM.DATA),
                        default: o.value === record.account_type,
                    })),
                })],
            ],
            close : CloseB,
            back  : BackB.as(AXN.ACCOUNTS_OPEN),
            submit: SubmitB.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const updateAccountType = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountTypeS.fromMap(state.cmap)!;

    const submission = buildCustomId({
        ...AXN.ACCOUNT_TYPE_SUBMIT.params,
        data: [action.selected[0].value],
    });

    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'updateAccountType',
            }),
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
            close : CloseB,
            back  : BackB.as(AXN.ACCOUNTS_OPEN),
            submit: SubmitB.as(submission, {disabled: false}),
        },
    };
}));


const submitAccountType = buildReducer((state, action) => E.gen(function * () {
    const selector = AccountTypeS.fromMap(state.cmap)!;

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
            info: jsonEmbed({
                type: 'submitAccountType',
            }),
            selected: state.view!.selected!,
            status  : jsonEmbed({
                success: `${playerTag} updated to ${accountType}`,
            }),
            rows: [
                [selector.as(AXN.NOOP, {disabled: true})],
            ],
            close : CloseB,
            back  : BackB.as(AXN.ACCOUNTS_OPEN),
            submit: SubmitB.as(AXN.NOOP1, {disabled: true}),
            next  : NextB.as(AXN.LINKS_OPEN),
        },
    };
}));


const startDeleteAccount = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'startDeleteAccount',
            }),
            rows: [
                [AccountTypeS.as(AXN.ACCOUNT_TYPE_UPDATE)],
            ],
            close : CloseB,
            back  : BackB.as(AXN.ACCOUNTS_OPEN),
            submit: DeleteB.as(AXN.ACCOUNT_TYPE_SUBMIT, {disabled: true}),
        },
    };
}));


const submitDeleteAccount = buildReducer((state, action) => E.gen(function * () {
    const [[selector]] = state.view!.rows! as [[MadeSelect]];

    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'submitDeleteAccount',
            }),
            rows: [
                [selector.as(action.id, {
                    ...selector.component,
                    options: selector.component.options!.map((o) => ({
                        ...o,
                        default: action.selected.map((s) => s.value).includes(o.value),
                    })),
                })],
            ],
            close : CloseB,
            back  : BackB.as(AXN.ACCOUNTS_OPEN),
            submit: SubmitB.as(AXN.ACCOUNT_TYPE_SUBMIT, {disabled: true}),
        },
    };
}));


export const reducerAccounts = {
    [AXN.ACCOUNTS_OPEN.predicate]: startAccounts,

    [AXN.ACCOUNTS_SELECT.predicate]       : startSelectAccount,
    [AXN.ACCOUNTS_SELECT_UPDATE.predicate]: updateSelectAccount,

    [AXN.ACCOUNT_TYPE_OPEN.predicate]  : startAccountType,
    [AXN.ACCOUNT_TYPE_UPDATE.predicate]: updateAccountType,
    [AXN.ACCOUNT_TYPE_SUBMIT.predicate]: submitAccountType,

    [AXN.ACCOUNT_DELETE_OPEN.predicate]  : startDeleteAccount,
    [AXN.ACCOUNT_DELETE_SUBMIT.predicate]: submitDeleteAccount,
};
