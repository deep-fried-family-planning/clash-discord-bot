import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {BackButton, CloseButton} from '#src/discord/ixc/components/global-components.ts';


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


export const reducerNewLink = {
    [AXN.START_NEW_LINK.predicate]: actionNewLinks,
};
