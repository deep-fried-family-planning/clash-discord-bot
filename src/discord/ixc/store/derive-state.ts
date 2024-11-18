import {parseCustomId} from '#src/discord/ixc/store/id.ts';
import type {ActionRow, Button, SelectMenu} from 'dfx/types';
import {IXCT, type IxD, type IxDc} from '#src/discord/util/discord.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {type DServer, getDiscordServer} from '#src/dynamo/discord-server.ts';
import {type DUser, getDiscordUser} from '#src/dynamo/discord-user.ts';
import {flatMapL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {BackButton, CloseButton, ForwardButton, NavSelect, NextButton, SubmitButton} from '#src/discord/ixc/components/global-components.ts';
import type {IxDcState} from '#src/discord/ixc/store/types.ts';
import {inspect} from 'node:util';
import {makeButtonFrom} from '#src/discord/ixc/components/make-button.ts';
import {makeSelectFrom} from '#src/discord/ixc/components/make-select.ts';


export type ComponentMapItem<T extends Button | SelectMenu = Button | SelectMenu> = {id: ReturnType<typeof parseCustomId>; original: T};


export const deriveState = (ix: IxD, d: IxDc) => E.gen(function * () {
    const [server, user] = yield * pipe(
        E.all([
            getDiscordServer({pk: ix.guild_id!, sk: 'now'}),
            getDiscordUser({pk: ix.member!.user!.id}),
        ], {concurrency: 'unbounded'}),
        E.catchAll(() => E.succeed([undefined, undefined])),
    );


    const components = pipe(
        (ix.message!.components as ActionRow[]),
        mapL((row) => pipe(
            row.components as (Button | SelectMenu)[],
            mapL((c) => {
                return {
                    id      : parseCustomId(c.custom_id!),
                    original: c,
                } as const;
            }),
        )),
    );


    const [, ...restRows] = components;
    const [, ...restReverseRows] = restRows.toReversed();
    const middleRows = restReverseRows.toReversed();

    const componentMap = pipe(
        components,
        flatMapL((c) => c),
        reduceL(emptyKV<string, Maybe<ComponentMapItem>>(), (cs, c) => {
            cs[c.id.predicate] = c;
            return cs;
        }),
    );

    const state = {
        server_id : ix.guild_id!,
        user_id   : ix.member!.user!.id,
        user_roles: ix.member!.roles,
        user      : user as DUser,
        server    : server as DServer,
        previous  : {
            embeds: ix.message!.embeds,
        },
        cmap: componentMap,
        view: {
            info     : ix.message?.embeds[0],
            selected : ix.message?.embeds[1],
            status   : ix.message?.embeds[2],
            navigator: NavSelect.fromMap(componentMap),
            rows     : pipe(
                middleRows,
                mapL((cs) => pipe(
                    cs,
                    mapL((c) => c.original.type === IXCT.BUTTON
                        ? makeButtonFrom(c.original as Button)
                        : makeSelectFrom(c.original as SelectMenu),
                    ),
                )),
            ),
            back   : BackButton.fromMap(componentMap),
            close  : CloseButton.fromMap(componentMap),
            forward: ForwardButton.fromMap(componentMap),
            next   : NextButton.fromMap(componentMap),
            submit : SubmitButton.fromMap(componentMap),
        },
    } as const satisfies IxDcState;

    yield * CSL.debug('[STATE]', inspect(state, true, null));

    return state;
});
