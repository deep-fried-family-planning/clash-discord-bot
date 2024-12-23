import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Cx} from '../system';


export type Sx = D.TaggedEnum<{
    Button: {value: str};
    Select: {value: str};
}>;


export const Sx = D.taggedEnum<Sx>();


export const SxMap = {
    [Cx.Cx.Row({} as any)._tag]    : '',
    [Cx.Cx.Button({} as any)._tag] : '',
    [Cx.Cx.Text({} as any)._tag]   : '',
    [Cx.Cx.String({} as any)._tag] : '',
    [Cx.Cx.User({} as any)._tag]   : '',
    [Cx.Cx.Role({} as any)._tag]   : '',
    [Cx.Cx.Channel({} as any)._tag]: '',
    [Cx.Cx.Mention({} as any)._tag]: '',
};

console.log(SxMap);
