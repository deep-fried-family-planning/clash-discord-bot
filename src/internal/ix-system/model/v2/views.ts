import {Button, Embed, makeView, Row} from '#src/internal/ix-system/store/make-view.ts';
import {createComponent} from '#src/internal/ix-system/store/make-component.ts';
import {Discord} from 'dfx';
import {v2TestSlice} from '#src/internal/ix-system/model/v2/slices.ts';
import {DriverError} from '#src/internal/ix-system/store/make-driver.ts';


const button = createComponent({
    name: 'button',
    type: Discord.ComponentType.BUTTON,
    base: {
        label: 'Pagination',
        style: Discord.ButtonStyle.PRIMARY,
    },
    modes: {
        base: () => ({
            next: 'clicked1',
            rest: {
                label: 'Toggle State 1',
                style: Discord.ButtonStyle.SUCCESS,
            },
        }),
        clicked1: () => ({
            next: 'clicked2',
            rest: {
                label: 'Toggle State 2',
                style: Discord.ButtonStyle.PRIMARY,
            },
        }),
        clicked2: () => ({
            next: 'clicked3',
            rest: {
                label: 'Toggle State 3',
                style: Discord.ButtonStyle.SECONDARY,
            },
        }),
        clicked3: () => ({
            next: 'clicked4',
            rest: {
                label: 'Toggle State 4',
                style: Discord.ButtonStyle.DANGER,
            },
        }),
        clicked4: () => ({
            next: 'clicked5',
            rest: {
                label: 'Toggle State 4.1',
                style: Discord.ButtonStyle.DANGER,
            },
        }),
        clicked5: () => ({
            next: 'base',
            rest: {
                label: 'Toggle State 4.2',
                style: Discord.ButtonStyle.DANGER,
            },
        }),
    },
});


const button2 = createComponent({
    name: 'button2',
    type: Discord.ComponentType.BUTTON,
    base: {
        label: 'Unrecoverable',
        style: Discord.ButtonStyle.DANGER,
    },
    modes: {
        base: () => {
            throw new DriverError({message: 'Teehee'});

            return {
                next: 'clicked1',
                rest: {
                    label: 'clicked1',
                },
            };
        },
        clicked1: () => ({
            next: 'clicked2',
            rest: {
                label: 'clicked2',
            },
        }),
        clicked2: () => ({
            next: 'base',
            rest: {
                label: 'base',
            },
        }),
    },
});


const button3 = createComponent({
    name: 'button3',
    type: Discord.ComponentType.BUTTON,
    base: {
        label: 'Recoverable',
        style: Discord.ButtonStyle.DANGER,
    },
    modes: {
        base: () => {
            throw new DriverError({message: 'Teehee'});

            return {
                next: 'clicked1',
                rest: {
                    label: 'clicked1',
                },
            };
        },
        clicked1: () => ({
            next: 'clicked2',
            rest: {
                label: 'clicked2',
            },
        }),
        clicked2: () => ({
            next: 'base',
            rest: {
                label: 'base',
            },
        }),
    },
});


const switchButton = createComponent({});


export const v2TestView = makeView('test', (s) => {
    console.log('view state', s);

    return [
        Embed({
            id         : 'test',
            description: 'test',
        }),
        [
            button.make({
                onClick: v2TestSlice.ax.ope,
            }),
        ],
        [
            button2.make({
                onClick: v2TestSlice.ax.accounts,
            }),
            button3.make({
                onClick: v2TestSlice.ax.errors,
            }),
        ],
    ];
});


export const v2TestView2 = makeView('test', (s) => {
    console.log('view state', s);

    return [
        Embed({
            id         : 'test',
            description: 'test',
        }),
        [
            button.make({
                onClick: v2TestSlice.ax.ope,
            }),
        ],
        [
            button2.make({
                onClick: v2TestSlice.ax.accounts,
            }),
            button3.make({
                onClick: v2TestSlice.ax.errors,
            }),
        ],
    ];
});
