import type {str} from '#src/internal/pure/types-pure.ts';
import type {Button as DfxButton, Embed as DfxEmbed, SelectMenu as DfxSelect} from 'dfx/types';
import type {createComponent} from '#src/ix/store/make-component.ts';


export const makeView = <
    State extends unknown,
>(
    name: str,
    view: (s: State) => (Ex | ReturnType<ReturnType<typeof createComponent>['make']>[])[],
) => ({
    name,
    view,
} as const);


type CxOnClick = {
    onClick: str;
};


type Ex =
    & {
        id: str;
    }
    & Partial<DfxEmbed>;


type Bx =
    & CxOnClick
    & Partial<DfxButton>;


type Slx =
    & CxOnClick
    & Partial<DfxSelect>;


export const Embed = (embed: Ex) => ({
    ...embed,
    author: {
        name: embed.id,
    },
});
export const Row = (...cs: (Bx[] | [Slx])) => cs;
export const Button = (button: Bx) => button;
export const Select = (select: Slx) => select;

//
// const test = makeView('test', (s) => {
//     return [
//         Embed({
//             id         : '',
//             description: '',
//         }),
//         Row(
//             Button({
//                 onClick: '',
//                 type   : 1,
//                 style  : 1,
//             }),
//         ),
//         Row(
//             Select({}),
//         ),
//     ] as const;
// });
