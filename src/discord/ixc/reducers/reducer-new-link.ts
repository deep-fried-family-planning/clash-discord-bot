import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackB, CloseB} from '#src/discord/ixc/components/global-components.ts';
import {AccountTypeS, LinkMB} from '#src/discord/ixc/components/components.ts';


const actionNewLinks = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'actionNewLinks',
            }),
            rows: [
                [AccountTypeS.as(AXN.NEW_LINK_UPDATE)],
            ],
            close  : CloseB,
            forward: LinkMB.as(AXN.NOOP, {disabled: true}),
            back   : BackB.as(AXN.LINKS_OPEN),
        },
    };
}));


const updateNewLinkType = buildReducer((state, action) => E.gen(function * () {
    const selected = action.selected[0].value;

    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'updateNewLinkType',
            }),
            rows: [
                [AccountTypeS.as(AXN.NEW_LINK_UPDATE).setDefaultValues([selected])],
            ],
            close  : CloseB,
            forward: LinkMB.as(AXN.NEW_LINK_MODAL_OPEN.withForward({forward: selected}), {disabled: false}),
            back   : BackB.as(AXN.LINKS_OPEN),
        },
    };
}));


const submitLinkModal = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed({
                type: 'submitLinkModal',
            }),
            status: jsonEmbed(action.original.components),
            back  : BackB.as(AXN.LINKS_OPEN),
            close : CloseB,
        },
    };
}));


export const reducerNewLink = {
    [AXN.NEW_LINK_OPEN.predicate]        : actionNewLinks,
    [AXN.NEW_LINK_UPDATE.predicate]      : updateNewLinkType,
    [AXN.NEW_LINK_MODAL_SUBMIT.predicate]: submitLinkModal,
};
