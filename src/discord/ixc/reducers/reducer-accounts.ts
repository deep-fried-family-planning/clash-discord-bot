import {E, ORD, pipe} from '#src/internal/pure/effect';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackB, CloseB, DeleteB, ForwardB, NextB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {AccountS, AccountTypeS, ChangeAccountTypeButton, DeleteAccountButton} from '#src/discord/ixc/components/components.ts';
import {getDiscordPlayer, putDiscordPlayer, queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {DELIM} from '#src/discord/ixc/store/id-routes.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import {Order} from 'effect';
import {toId} from '#src/discord/ixc/store/id-build.ts';


const startAccounts = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'startAccounts',
        }),
        row1: [
            ChangeAccountTypeButton.as(AXN.ACCOUNTS_SELECT.withForward({
                nextKind: AXN.ACCOUNT_TYPE_OPEN.params.kind,
                nextType: AXN.ACCOUNT_TYPE_OPEN.params.type,
            })),
            DeleteAccountButton.as(AXN.ACCOUNTS_SELECT.withForward({
                nextKind: AXN.ACCOUNT_DELETE_OPEN.params.kind,
                nextType: AXN.ACCOUNT_DELETE_OPEN.params.type,
            })),
        ],
        close: CloseB,
        back : BackB.as(AXN.LINKS_OPEN),
    };
}));


const startSelectAccount = typeRx((s, ax) => E.gen(function * () {
    const records = pipe(
        yield * queryPlayersForUser({pk: s.user_id}),
        sortWithL((r) => r.sk, Order.string),
    );

    const players = pipe(
        yield * Clashofclans.getPlayers(records.map((r) => r.sk)),
        sortWithL((p) => p.tag, Order.string),
    );

    const together = zipL(records, players);

    const forwardId = AXN.ACCOUNTS_SELECT_UPDATE.withForward({
        nextKind: ax.id.params.nextKind!,
        nextType: ax.id.params.nextType!,
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'startSelectAccount',
        }),
        selected: jsonEmbed({
            playerTag: 'not selected',
        }),
        sel1: AccountS.as(forwardId, {
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
        }),
        close  : CloseB,
        back   : BackB.as(AXN.ACCOUNTS_OPEN),
        forward: ForwardB.as(AXN.NOOP, {disabled: true}),
    };
}));


const updateSelectAccount = typeRx((s, ax) => E.gen(function * () {
    const selector = AccountS.fromMap(s.cmap)!;

    const forward = toId({
        kind   : ax.id.params.nextKind!,
        type   : ax.id.params.nextType!,
        forward: ax.selected[0].value,
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'updateSelectAccount',
        }),
        selected: jsonEmbed({
            playerTag: ax.selected[0].value,
        }),
        sel1: selector.as(ax.id, {
            options: selector.component.options!.map((o) => ({
                ...o,
                default: ax.selected.map((s) => s.value).includes(o.value),
            })),
        }),
        close  : CloseB,
        back   : BackB.as(AXN.ACCOUNTS_OPEN),
        forward: ForwardB.as(forward, {disabled: false}),
    };
}));


const startAccountType = typeRx((s, ax) => E.gen(function * () {
    const playerTag = ax.forward;

    const record = yield * getDiscordPlayer({pk: s.user_id, sk: playerTag!});

    return {
        ...s,
        info: jsonEmbed({
            type: 'startAccountType',
        }),
        selected: jsonEmbed({
            playerTag,
            accountType: record.account_type,
        }),
        sel1: AccountTypeS.as(AXN.ACCOUNT_TYPE_UPDATE, {
            options: AccountTypeS.options.options!.map((o) => ({
                ...o,
                value  : [playerTag, o.value].join(DELIM.DATA),
                default: o.value === record.account_type,
            })),
        }),
        close : CloseB,
        back  : BackB.as(AXN.ACCOUNTS_OPEN),
        submit: SubmitB.as(AXN.NOOP, {disabled: true}),
    };
}));


const updateAccountType = typeRx((s, ax) => E.gen(function * () {
    const selector = AccountTypeS.fromMap(s.cmap)!;

    const submission = toId({
        ...AXN.ACCOUNT_TYPE_SUBMIT.params,
        data: [ax.selected[0].value],
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'updateAccountType',
        }),
        selected: jsonEmbed({
            ...JSON.parse(s.select!.description!),
            accountType: ax.selected[0].value,
        }),
        sel1: selector.as(ax.id, {
            options: selector.component.options!.map((o) => ({
                ...o,
                default: ax.selected.map((s) => s.value).includes(o.value),
            })),
        }),
        close : CloseB,
        back  : BackB.as(AXN.ACCOUNTS_OPEN),
        submit: SubmitB.as(submission, {disabled: false}),
    };
}));


const submitAccountType = typeRx((s, ax) => E.gen(function * () {
    const selector = AccountTypeS.fromMap(s.cmap)!;

    const [playerTag, accountType] = ax.id.params.data!;

    const record = yield * getDiscordPlayer({pk: s.user_id, sk: playerTag});
    yield * putDiscordPlayer({
        ...record,
        updated     : new Date(Date.now()),
        account_type: accountType,
    });

    return {
        ...s,
        info: jsonEmbed({
            type: 'submitAccountType',
        }),
        selected: s.select!,
        status  : jsonEmbed({
            success: `${playerTag} updated to ${accountType}`,
        }),
        sel1  : selector.as(AXN.NOOP, {disabled: true}),
        back  : BackB.as(AXN.ACCOUNTS_OPEN),
        submit: SubmitB.as(AXN.NOOP1, {disabled: true}),
        next  : NextB.as(AXN.LINKS_OPEN),
    };
}));


const startDeleteAccount = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'startDeleteAccount',
        }),
        sel1  : AccountTypeS.as(AXN.ACCOUNT_TYPE_UPDATE),
        back  : BackB.as(AXN.ACCOUNTS_OPEN),
        submit: DeleteB.as(AXN.ACCOUNT_TYPE_SUBMIT, {disabled: true}),
    };
}));


const submitDeleteAccount = typeRx((s, ax) => E.gen(function * () {
    const selector = AccountTypeS.fromMap(s.cmap)!;

    return {
        ...s,
        info: jsonEmbed({
            type: 'submitDeleteAccount',
        }),
        sel1: selector.as(ax.id, {
            ...selector.component,
            options: selector.component.options!.map((o) => ({
                ...o,
                default: ax.selected.map((s) => s.value).includes(o.value),
            })),
        }),
        close : CloseB,
        back  : BackB.as(AXN.ACCOUNTS_OPEN),
        submit: SubmitB.as(AXN.ACCOUNT_TYPE_SUBMIT, {disabled: true}),
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
