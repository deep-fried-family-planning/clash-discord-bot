import {Ar, CSL, E, Kv, ORD, ORDS, p} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {original} from '#src/discord/ixc-original.ts';
import {Discord, UI} from 'dfx';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {CxId} from '#src/internal/ix-v2/id/cx-id.ts';
import {RK_ENTRY} from '#src/constants/route-kind.ts';
import {runner} from '#src/internal/ix-v2/runner.ts';
import {v3_driver} from '#src/discord/v3/v3.ts';
import {inspect} from 'node:util';


const drivers = [
    v3_driver,
];


const router = (ix: IxD) => E.gen(function * () {
    const data = ix.data;

    yield * CSL.debug('data', data);

    if (!data) {
        yield * CSL.debug('no data');
        return;
    }
    if (!('custom_id' in data)) {
        yield * CSL.debug('no custom_id');
        return;
    }
    if (!('message' in ix)) {
        yield * CSL.debug('no message');
        return;
    }

    const driver = drivers.find((driver) => data.custom_id.startsWith(`/${driver.name}`));


    if (!driver) {
        yield * CSL.debug('no driver');
        return yield * original(ix);
    }

    return yield * runner(driver, ix);
}).pipe(
    E.catchTag('DriverError', (e) => E.gen(function * () {
        console.error(inspect(e, false, null, true));

        const embeds = ix.message?.embeds;

        const ex = p(
            ix.message!.embeds,
            Ar.filter((e) => !!e.author?.name),
            Kv.fromIterableWith((e) => [e.author!.name, e] as const),
        );

        ex['ohshit'] = {
            author: {
                name: 'ohshit',
            },
            title      : `Recoverable Error: ${e.message}`,
            description: 'Ya dun goofed, click restart',
            color      : nColor(COLOR.ERROR),
        };

        const em = p(
            ex,
            Ar.fromRecord,
            Ar.sortBy(
                ORD.mapInput(ORDS, ([,embed]) => embed.author?.name ?? ''),
            ),
            Ar.map(([, embed]) => embed),
        );


        yield * DiscordApi.editMenu(ix, {
            embeds: [
                ...embeds,
                {
                    author: {
                        name: 'ohshit',
                    },
                    title      : `Recoverable Error: ${e.message}`,
                    description: 'Ya dun goofed, click restart from last UI state',
                    color      : nColor(COLOR.ERROR),
                },
            ],
            components: UI.grid([
                ...p(
                    ix.message!.components,
                    Ar.map((cs) => p(cs.components, Ar.map((c) => ({
                        ...c,
                        disabled: true,
                    })))),
                ),
                [
                    UI.button({
                        style    : Discord.ButtonStyle.SUCCESS,
                        custom_id: CxId.build({
                            origin   : 'test',
                            slice    : 'test',
                            action   : 'test',
                            ctype    : 'test',
                            cmode    : 'test',
                            row      : 'test',
                            col      : 'test',
                            view     : 'test',
                            modifiers: RK_ENTRY,
                        }),
                        label: 'Recover',
                    }),
                ],
            ]),
        });
    })),
    E.catchAllDefect((e) => CSL.log(inspect(e, true, null, true))),
);


export const ixcRouter = (ix: IxD) => p(
    router(ix), // todo add "recoverable error"
);

