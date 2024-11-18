import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackButton, CloseButton} from '#src/discord/ixc/components/global-components.ts';
import {AccountTypeSelector, LinkModalButton} from '#src/discord/ixc/components/components.ts';


const actionNewLinks = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [AccountTypeSelector.as(AXN.UPDATE_NEW_LINK_TYPE)],
            ],
            close  : CloseButton,
            forward: LinkModalButton.as(AXN.NOOP, {disabled: true}),
            back   : BackButton.as(AXN.START_LINKS),
        },
    };
}));


const updateNewLinkType = buildReducer((state, action) => E.gen(function * () {
    const selected = action.selected[0].value;

    return {
        ...state,
        view: {
            info: jsonEmbed(action),
            rows: [
                [AccountTypeSelector.as(AXN.UPDATE_NEW_LINK_TYPE).setDefaultValues([selected])],
            ],
            close  : CloseButton,
            forward: LinkModalButton.as(AXN.MODAL_NEW_LINK_OPEN, {disabled: false}),
            back   : BackButton.as(AXN.START_LINKS),
        },
    };
}));


const submitLinkModal = buildReducer((state, action) => E.gen(function * () {
    return {
        ...state,
        view: {
            info: jsonEmbed(action.original),
        },
    };
}));


export const reducerNewLink = {
    [AXN.START_NEW_LINK.predicate]       : actionNewLinks,
    [AXN.UPDATE_NEW_LINK_TYPE.predicate] : updateNewLinkType,
    [AXN.MODAL_NEW_LINK_SUBMIT.predicate]: submitLinkModal,
};
