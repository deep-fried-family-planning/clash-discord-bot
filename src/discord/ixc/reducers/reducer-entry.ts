import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {AccountsButton, NewLinkButton, UserButton} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {CloseButton} from '#src/discord/ixc/components/global-components.ts';


const entryLinks = buildReducer((state, action) => E.gen(function * () {
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


export const reducerEntry = {
    [AXN.ENTRY_LINKS.predicate]: entryLinks,
    [AXN.START_LINKS.predicate]: entryLinks,
};
