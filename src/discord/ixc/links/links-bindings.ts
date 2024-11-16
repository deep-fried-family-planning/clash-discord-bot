import {LinksEntryB, NewLinkB} from '#src/discord/ixc/links/links-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {UI} from 'dfx';
import {GlobalCloseB, IXCNoop} from '#src/discord/ixc/make/global.ts';
import {UserB} from '#src/discord/ixc/links/user-components.ts';
import {AccountsB} from '#src/discord/ixc/links/accounts-components.ts';
import {IXCBS} from '#src/discord/util/discord.ts';


export const LinksEntryBB = LinksEntryB.bind((ix, d) => E.gen(function * () {
    return {
        embeds    : [jsonEmbed(d)],
        components: UI.grid([
            [
                NewLinkB.component,
                AccountsB.componentWith('', {style: IXCBS.PRIMARY}),
                UserB.componentWith('', {style: IXCBS.PRIMARY}),
            ],
            [
                GlobalCloseB.component,
            ],
        ]),
    };
}));


export const NewLinkBB = NewLinkB.bind(IXCNoop);


