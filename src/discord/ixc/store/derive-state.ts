import type {ActionRow, Button, Embed, SelectMenu, Snowflake, TextInput} from 'dfx/types';
import type {IxD, IxDc} from '#src/discord/util/discord.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {type DServer, getDiscordServer} from '#src/dynamo/discord-server.ts';
import {type DUser, getDiscordUser} from '#src/dynamo/discord-user.ts';
import {flatMapL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {BackB, CloseB, NextB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {fromId} from '#src/discord/ixc/store/id-parse.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {MadeSelect} from '#src/discord/ixc/components/make-select.ts';
import type {MadeButton} from '#src/discord/ixc/components/make-button.ts';
import {FOOTER} from '#src/discord/ixc/store/types.ts';
import {isEditor, isViewer} from '#src/discord/ixc/components/component-utils.ts';


export type IxState = {
    original: IxD;

    server_id : Snowflake;
    user_id   : Snowflake;
    user_roles: Snowflake[];
    server?   : DServer | undefined;
    user?     : DUser | undefined;

    title?      : str | und;
    description?: str | und;
    info?       : Embed | und;
    select?     : Embed | und;
    status?     : Embed | und;
    error?      : Embed | und;
    debug?      : Embed | und;

    cmap?: Record<string, Maybe<ComponentMapItem>>;

    viewer?: Embed | und;
    editor?: Embed | und;

    navigate?: MadeSelect | undefined;
    row1?    : (MadeButton | und)[];
    sel1?    : MadeSelect | und;
    row2?    : (MadeButton | und)[];
    sel2?    : MadeSelect | und;
    row3?    : (MadeButton | und)[];
    sel3?    : MadeSelect | und;
    start?   : MadeSelect | undefined;
    back?    : MadeButton | undefined;
    submit?  : MadeButton | undefined;
    delete?  : MadeButton | undefined;
    next?    : MadeButton | undefined;
    forward? : MadeButton | undefined;
    close?   : MadeButton | undefined;
};


export const deriveState = (ix: IxD, d: IxDc) => E.gen(function * () {
    const [server, user] = yield * pipe(
        E.all([
            getDiscordServer({pk: ix.guild_id!, sk: 'now'}),
            getDiscordUser({pk: ix.member!.user!.id}),
        ], {concurrency: 'unbounded'}),
        E.catchAll(() => E.succeed([undefined, undefined])),
    );


    const componentMap = ('components' in (ix.message ?? {}))
        ? pipe(
            (ix.message!.components as ActionRow[]),
            mapL((row) => pipe(
                row.components as (Button | SelectMenu)[],
                mapL((c) => {
                    return {
                        id      : fromId(c.custom_id!),
                        original: c,
                    } as const;
                }),
            )),
            flatMapL((c) => c),
            reduceL(emptyKV<string, Maybe<ComponentMapItem>>(), (cs, c) => {
                cs[c.id.predicate] = c;
                return cs;
            }),
        )
        : undefined;

    const firstEmbed = ix.message?.embeds.at(0);

    return {
        original   : ix,
        server_id  : ix.guild_id!,
        user_id    : ix.member!.user!.id,
        user_roles : ix.member!.roles,
        user       : user,
        server     : server,
        cmap       : componentMap!,
        title      : firstEmbed?.title,
        description: firstEmbed?.description,
        viewer     : ix.message?.embeds.find(isViewer),
        editor     : ix.message?.embeds.find(isEditor),
        status     : ix.message?.embeds.find(
            (embed) => [FOOTER.CONFIRM, FOOTER.SUCCESS, FOOTER.FAILURE].includes(embed.footer?.text as FOOTER),
        ),
        // info      : ix.message?.embeds[0],
        // select    : ix.message?.embeds[1],
        // status    : ix.message?.embeds[2],
        // navigate  : NavSelect.fromMap(componentMap),
        back  : BackB.fromMap(componentMap),
        close : CloseB.fromMap(componentMap),
        // forward   : ForwardB.fromMap(componentMap),
        next  : NextB.fromMap(componentMap),
        submit: SubmitB.fromMap(componentMap),
    } as const satisfies IxState;
});


export type ComponentMapItem<T extends Button | SelectMenu | TextInput = Button | SelectMenu | TextInput> = {id: ReturnType<typeof fromId>; original: T};
