import * as TSTAGE from '#src/ix/enum/stage.ts';
import * as TSCOPE from '#src/ix/enum/scope.ts';
import * as TCURRENT from '#src/ix/enum/current.ts';
import * as TCOL from '#src/ix/enum/col.ts';
import * as TTYPE from '#src/ix/enum/type.ts';
import * as TORIGIN from '#src/ix/enum/origin.ts';
import * as TMODIFIERS from '#src/ix/enum/modifiers.ts';
import * as TROW from '#src/ix/enum/row.ts';
import * as TPROTOCOL from '#src/ix/enum/protocol.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const Origin = TORIGIN;
export const Current = TCURRENT;
export const Type = TTYPE;
export const Stage = TSTAGE;
export const Scope = TSCOPE;
export const Row = TROW;
export const Col = TCOL;
export const Modifiers = TMODIFIERS;


export type Origin = typeof TORIGIN[keyof typeof TORIGIN];
export type Current = typeof TCURRENT[keyof typeof TCURRENT];
export type Scope = str;
export type Type = typeof TTYPE[keyof typeof TTYPE];
export type Stage = typeof TSTAGE[keyof typeof TSTAGE];
export type Row = typeof TROW[keyof typeof TROW];
export type Col = typeof TCOL[keyof typeof TCOL];
export type Modifiers = typeof TMODIFIERS[keyof typeof TMODIFIERS];


export const Protocol = TPROTOCOL;
export type Protocol = typeof TPROTOCOL;
