import {E} from '#src/internal/pure/effect';
import {AdminB, BackB, DeleteB, DeleteConfirmB, ForwardB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {deleteDiscordPlayer, getDiscordPlayer, putDiscordPlayer} from '#src/dynamo/discord-player.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {asConfirm, asEditor, asSuccess} from '#src/discord/ixc/components/component-utils.ts';
import {AccountViewerAccountS, AccountViewerB} from '#src/discord/ixc/view-reducers/account-viewer.ts';
import {SELECT_ACCOUNT_TYPE} from '#src/discord/ix-constants.ts';


const submit = (s: IxState, playerTag: str, accountType: str) => E.gen(function * () {
    const record = yield * getDiscordPlayer({pk: s.user_id, sk: playerTag});
    yield * putDiscordPlayer({
        ...record,
        updated     : new Date(Date.now()),
        account_type: accountType,
    });
});
const deletePlayer = (s: IxState, playerTag: str) => E.gen(function * () {
    yield * deleteDiscordPlayer({pk: s.user_id, sk: playerTag});
});


export const AccountViewerAdminB = AdminB.as(makeId(RDXK.OPEN, 'AVA'));
const AccountTypeS = SingleS.as(makeId(RDXK.UPDATE, 'AVAT'), {
    placeholder: 'Select Account Type',
    options    : SELECT_ACCOUNT_TYPE,
});
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'AVA'));
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'AVA'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RDXK.DELETE_CONFIRM, 'AVA'));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Account = AccountViewerAccountS.fromMap(s.cmap);
    const AccountType = AccountTypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (Submit.clicked(ax)) {
        yield * submit(s, Account.values[0], AccountType.values[0]);
    }

    if (DeleteConfirm.clicked(ax)) {
        yield * deletePlayer(s, Account.values[0]);
    }

    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    return {
        ...s,
        title      : 'Account',
        description: undefined,

        viewer: undefined,
        editor: asEditor(
            s.viewer
            ?? s.editor,
        ),
        status:
            Submit.clicked(ax) ? asSuccess({description: 'Account Edited'})
            : Delete.clicked(ax) ? asConfirm({description: 'Are you sure?'})
            : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Account Deleted'})
            : undefined,

        sel1: Account.render({disabled: true}),
        sel2: AccountType.render({disabled: Submit.clicked(ax) || DeleteConfirm.clicked(ax)}),

        submit: Submit.render({
            disabled:
                Submit.clicked(ax)
                || Delete.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || AccountType.values.length === 0,
        }),
        delete: (
            Delete.clicked(ax)
                ? DeleteConfirm
                : Delete
        ).render({
            disabled:
                Submit.clicked(ax)
                || DeleteConfirm.clicked(ax),
        }),
        back   : BackB.as(AccountViewerB.id),
        forward: Forward.render({
            disabled: !Submit.clicked(ax) || !DeleteConfirm.clicked(ax),
        }),
    };
}));


export const accountViewerAdminReducer = {
    [AccountViewerAdminB.id.predicate]: view,
    [AccountTypeS.id.predicate]       : view,
    [Submit.id.predicate]             : view,
    [Delete.id.predicate]             : view,
    [DeleteConfirm.id.predicate]      : view,
};
