import type {bool, num, str} from '#src/internal/pure/types-pure.ts';
import type {Button as DfxButton, Embed as DfxEmbed, SelectMenu as DfxSelect} from 'dfx/types';
import {Ar, pipe} from '#src/internal/pure/effect.ts';
import type {RestButton, RestEmbed, RestSelect, RestText} from '#src/internal/ix-system/model/types.ts';


type ViewArr = (Ex | (Bx | Slx)[])[];


export const make = <
    State extends unknown,
>(
    name: str,
    view: (s: State, sc: unknown, sn: unknown) => ViewArr,
) => ({
    name,
    view,
} as const);


export const mapEmbeds = (
    f: (embed: Ex) => {
        id  : Ex['id'];
        rest: RestEmbed;
    },
) => (
    arr: ViewArr,
) => pipe(
    arr,
    Ar.filter((e) => !Ar.isArray(e)),
    Ar.map((e) => f(e as Ex)),
);


export const mapComponents = (
    f: (component: Bx | Slx, row: num, col: num) => {
        mount    : bool;
        predicate: str;
        rest     : RestButton | RestSelect | RestText;
    },
) => (
    arr: ViewArr,
) => pipe(
    arr as unknown[],
    Ar.filter((e) => Ar.isArray(e)),
    Ar.map((cs, row) => pipe(
        cs as (Bx | Slx)[],
        Ar.map((c, col) => f(c, row, col))),
    ),
);


type CxOnClick = {
    driver?   : str;
    view?     : str;
    modifiers?: str;
    onClick: {
        slice: str;
        name : str;
    };
};


type Ex =
    & {
        id: str;
    }
    & Partial<DfxEmbed>;


export type Bx =
    & CxOnClick
    & Partial<DfxButton>;


export type Slx =
    & CxOnClick
    & Partial<DfxSelect>;


export const Embed = (embed: Ex) => ({
    ...embed,
    author: {
        ...embed.author,
        name: embed.id,
    },
});
export const Row = (...cs: (Bx[] | [Slx])) => cs;
export const Button = (button: Bx) => button;
export const Select = (select: Slx) => select;

