import type {ActionRow, Button, SelectMenu, TextInput} from 'dfx/types';
import type {IxD, IxDc} from '#src/discord/util/discord.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {getDiscordServer} from '#src/dynamo/discord-server.ts';
import {getDiscordUser} from '#src/dynamo/discord-user.ts';
import {flatMapL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {BackB, CloseB, ForwardB, NavSelect, NextB, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import type {IxState} from '#src/discord/ixc/store/types.ts';
import {inspect} from 'node:util';
import {fromId} from '#src/discord/ixc/store/id-parse.ts';


export type ComponentMapItem<T extends Button | SelectMenu | TextInput = Button | SelectMenu | TextInput> = {id: ReturnType<typeof fromId>; original: T};


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

    const state = {
        original  : ix,
        server_id : ix.guild_id!,
        user_id   : ix.member!.user!.id,
        user_roles: ix.member!.roles,
        user      : user,
        server    : server,
        cmap      : componentMap!,
        // info      : ix.message?.embeds[0],
        // select    : ix.message?.embeds[1],
        // status    : ix.message?.embeds[2],
        // navigate  : NavSelect.fromMap(componentMap),
        back      : BackB.fromMap(componentMap),
        close     : CloseB.fromMap(componentMap),
        // forward   : ForwardB.fromMap(componentMap),
        next      : NextB.fromMap(componentMap),
        submit    : SubmitB.fromMap(componentMap),
    } as const satisfies IxState;

    yield * CSL.debug('[STATE]', inspect(state, true, null));

    return state;
});
