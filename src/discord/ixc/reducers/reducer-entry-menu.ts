import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {AccountTypeS, LinkMB} from '#src/discord/ixc/components/components.ts';
import {BackB} from '#src/discord/ixc/components/global-components.ts';


const openNewLink = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'New Link',
        description: 'New Link',
        sel1       : AccountTypeS.as(AXN.NLINK_UPDATE),
        forward    : LinkMB.as(AXN.NOOP, {disabled: true}),
        back       : BackB.backward(AXN.LINKS_OPEN),
    };
}));


export const reducerEntryMenu = {
    [AXN.NLINK_OPEN.predicate]: openNewLink,
};
