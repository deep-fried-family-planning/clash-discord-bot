import {UserB, UserQhEndSSS, UserQhStartSSS, UserTzSSS} from '#src/discord/ixc/old/links/user-components.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {UI} from 'dfx';
import {getDiscordUser, putDiscordUser} from '#src/dynamo/discord-user.ts';
import {parseStdDataId} from '#src/discord/ixc/old/make/namespace.ts';
import {DeepFryerUnknownError} from '#src/internal/errors.ts';
import {GlobalCloseB} from '#src/discord/ixc/old/make/global.ts';


export const UserBB = UserB.bind((ix, d, s) => E.gen(function * () {
    return {
        embeds: [{
            title      : 'User Settings',
            description: jsonEmbed(d).description,
        }],
        components: UI.grid([
            [UserTzSSS.start.component],
            [UserQhStartSSS.start.component],
            [UserQhEndSSS.start.component],
            [
                GlobalCloseB.component,
            ],
        ]),
    };
}));


export const UserTzSSSB = UserTzSSS.bind(
    UserBB.handler,
    UserBB.handler,
    (ix, d) => E.gen(function * () {
        const user = yield * getDiscordUser({pk: ix.member!.user!.id});

        const [timezone] = parseStdDataId(d.custom_id);

        yield * putDiscordUser({
            ...user,
            updated : new Date(Date.now()),
            timezone: yield * S.decodeUnknown(S.TimeZone)(timezone),
        });
    }),
);


export const UserQhStartSSSB = UserQhStartSSS.bind(
    UserBB.handler,
    UserBB.handler,
    (ix, d) => E.gen(function * () {
        const user = yield * getDiscordUser({pk: ix.member!.user!.id});

        const [start] = parseStdDataId(d.custom_id);
        const [, end] = user.quiet?.split('-') ?? [];

        if (!end) {
            return yield * new DeepFryerUnknownError({issue: 'Record Broken'});
        }

        yield * putDiscordUser({
            ...user,
            updated: new Date(Date.now()),
            quiet  : `${start}-${end}`,
        });
    }),
);


export const UserQhEndSSSB = UserQhEndSSS.bind(
    UserBB.handler,
    UserBB.handler,
    (ix, d) => E.gen(function * () {
        const user = yield * getDiscordUser({pk: ix.member!.user!.id});

        const [end] = parseStdDataId(d.custom_id);
        const [start] = user.quiet?.split('-') ?? [];

        if (!start) {
            return yield * new DeepFryerUnknownError({issue: 'Record Broken'});
        }

        yield * putDiscordUser({
            ...user,
            updated: new Date(Date.now()),
            quiet  : `${start}-${end}`,
        });
    }),
);
