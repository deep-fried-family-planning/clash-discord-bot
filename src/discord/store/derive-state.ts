import type {ActionRow, Button, Embed, EmbedField, SelectMenu, Snowflake, TextInput} from 'dfx/types';
import type {IxD} from '#src/internal/discord.ts';
import {Ar, E, f, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import {flatMapL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {fromId} from '#src/discord/store/id-parse.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {MadeSelect} from '#src/discord/components/make-select.ts';
import type {MadeButton} from '#src/discord/components/make-button.ts';
import {isEditor, isStatus, isSystem, isViewer} from '#src/discord/components/component-utils.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {snflk} from '#src/discord/types.ts';
import {ME} from '#src/scratch/secret.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {Discord} from 'dfx';


export type St = {
    original: IxD;

    server_id : Snowflake;
    user_id   : Snowflake;
    user_roles: Snowflake[];
    server?   : DServer | undefined;
    user?     : DUser | undefined;

    reference: Record<str, str>;

    system?     : EmbedField[] | und;
    type?       : str | und;
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


const toComponentMap = f(
    (rows: ActionRow[]) => rows,
    Ar.map((row) => row.components as (Button | SelectMenu)[]),
    Ar.flatten,
    Kv.fromIterableWith((c) => [c.custom_id!, c]),

);


export const deriveState = (ix: IxD, ax: Ax) => E.gen(function * () {
    const [server, user] = yield * pipe(
        [
            MenuCache.serverRead(ix.guild_id!),
            MenuCache.userRead(ix.member?.user?.id ?? ix.user!.id),
        ] as const,
        E.allWith(),
        E.catchTag('DeepFryerDynamoError', () => E.succeed([undefined, undefined])),
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
                if (ax.id.predicate === c.id.predicate) {
                    if (c.original.type === Discord.ComponentType.STRING_SELECT) {
                        cs[c.id.predicate] = {
                            ...c,
                            original: {
                                ...c.original,
                                options: (c.original as SelectMenu).options?.map((o) => ({
                                    ...o,
                                    default: ax.selected.map((s) => s.value).includes(o.value),
                                })),
                            } as any,
                        };
                    }
                }
                else {
                    cs[c.id.predicate] = c;
                }

                return cs;
            }),
        )
        : undefined;

    const system = ix.message?.embeds.find(isSystem);

    const roles = [
        ...ix.member!.roles,
    ];

    if (ix.member?.user?.id === ME) {
        roles.push(server?.admin as snflk);
    }

    return {
        original  : ix,
        server_id : ix.guild_id!,
        user_id   : ix.member!.user!.id,
        user_roles: roles,
        user      : user,
        server    : server,

        reference: pipe(
            system?.fields ?? [],
            reduceL(emptyKV<str, str>(), (cs, c) => {
                cs[c.name] = c.value;
                return cs;
            }),
        ),

        cmap: componentMap!,

        // system     : system?.fields,
        type       : system?.author?.name,
        title      : system?.title,
        description: system?.description,

        viewer: ix.message?.embeds.find(isViewer),
        editor: ix.message?.embeds.find(isEditor),
        status: ix.message?.embeds.find(isStatus),
    } as const satisfies St;
});


export type ComponentMapItem<T extends Button | SelectMenu | TextInput = Button | SelectMenu | TextInput> = {id: ReturnType<typeof fromId>; original: T};
