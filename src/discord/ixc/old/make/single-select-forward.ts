import {UI} from 'dfx';
import {makeButton, makeStringSelect} from '#src/discord/ixc/old/make/components.ts';
import {type ExEff, type IXCEffect, stdData, stdNamespace} from '#src/discord/ixc/old/make/namespace.ts';
import {IXCBS, type IxD, type IxDc} from '#src/discord/util/discord.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {Embed, SelectMenu} from 'dfx/types';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';
import {resolveSelectData} from '#src/discord/ixc/old/make/resolvers.ts';
import {GlobalCloseB} from '#src/discord/ixc/old/make/global.ts';


export const makeSingleSelectSubmit = (
    namespace: string,
    label: string,
    ops?: {
        submitOptions?: Partial<Parameters<typeof UI.button>[0]>;
        selectOptions?: Partial<Parameters<typeof UI.select>[0]>;
    },
) => {
    const self = {
        namespace,
        start: makeButton(stdNamespace(namespace, 'STB'), {
            label: label,
            style: IXCBS.SUCCESS,
        }),
        back: makeButton(stdNamespace(namespace, 'BKB'), {
            label: 'Back',
            style: IXCBS.SECONDARY,
        }),
        submit: makeButton(stdNamespace(namespace, 'SUB'), {
            label: ops?.submitOptions?.label ?? 'Save',
            style: ops?.submitOptions?.style ?? IXCBS.SUCCESS,
        }),
        next: makeButton(stdNamespace(namespace, 'NTB'), {
            label: 'Next',
            style: IXCBS.PRIMARY,
        }),
        select: makeStringSelect(stdNamespace(namespace, 'SSS'), {
            options: [],
            ...ops?.selectOptions,
        }),
    };

    const updateMessage = (ix: IxD, d: IxDc) => {
        const [staticEmbed] = ix.message!.embeds;
        const data = resolveSelectData(0, ix, d);

        return {
            embeds: [
                staticEmbed,
                {
                    description: dLinesS(
                        'kind',
                        label,
                        'selected',
                        data.values.join('\n'),
                    ),
                },
            ],
            components: UI.grid([
                [data.selector],
                [
                    self.back.component,
                    self.submit.componentWith(stdData(data.values), {}),
                    self.next.component,
                ],
                [GlobalCloseB.component],
            ]),
        };
    };

    return {
        start     : self.start,
        components: self,
        ops       : ops?.selectOptions,
        bind      : <
            B extends (ix: IxD, d: IxDc) => IXCEffect,
            N extends (ix: IxD, d: IxDc) => IXCEffect,
            I extends (ix: IxD, d: IxDc) => ExEff<{select: Parameters<typeof UI.select>[0]; embed: Embed}>,
            S extends (ix: IxD, d: IxDc) => ExEff<void>,
        >(
            back: B,
            next: N,
            submit?: S,
            init?: I,
        ) => [
            self.back.bind(back),
            self.next.bind(next),
            self.start.bind((ix, d) => E.gen(function * () {
                const initial = yield * init?.(ix, d) ?? E.succeed({
                    embed : jsonEmbed(d),
                    select: {options: [], ...ops?.selectOptions},
                });

                return {
                    embeds    : [initial.embed],
                    components: UI.grid([
                        [
                            self.select.componentWith('', initial.select),
                        ],
                        [
                            self.back.component,
                            self.submit.componentWith('', {disabled: true}),
                            self.next.component,
                        ],
                        [GlobalCloseB.component],
                    ]),
                };
            })),
            self.select.bind((ix, d) => E.succeed(updateMessage(ix, d))),
            self.submit.bind((ix, d) => E.gen(function * () {
                yield * submit?.(ix, d) ?? E.void;

                const updated = updateMessage(ix, d);
                const selector = {
                    ...updated.components[0].components[0],
                    disabled: true,
                };

                return {
                    embeds: [
                        updated.embeds[0],
                        {
                            description: dLinesS(
                                'kind',
                                label,
                                'selected',
                                d.values?.join('\n') ?? '',
                            ),
                        },
                        {
                            color      : nColor(COLOR.SUCCESS),
                            description: dLinesS('record updated'),
                        },
                    ],
                    components: UI.grid([
                        [selector as SelectMenu],
                        [
                            self.back.component,
                            self.submit.componentWith('', {disabled: true}),
                            self.next.component,
                        ],
                        [GlobalCloseB.component],
                    ]),
                };
            })),
        ],
    };
};
