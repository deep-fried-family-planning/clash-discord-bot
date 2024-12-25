import type * as C_BMULTI from '#src/ix/enum/button-mode.ts';
import type * as C_COL from '#src/ix/enum/col.ts';
import type * as C_KIND from '#src/ix/enum/kind.ts';
import type * as C_MOD from '#src/ix/enum/mod.ts';
import type * as C_ROW from '#src/ix/enum/row.ts';


export type BMULTI = typeof C_BMULTI;
export type COL = typeof C_COL;
export type KIND = typeof C_KIND;
export type MOD = typeof C_MOD;
export type ROW = typeof C_ROW;

export type BMulti = typeof C_BMULTI[keyof typeof C_BMULTI];
export type Col = typeof C_COL[keyof typeof C_COL];
export type Kind = typeof C_KIND[keyof typeof C_KIND];
export type Mod = typeof C_MOD[keyof typeof C_MOD];
export type Row = typeof C_ROW[keyof typeof C_ROW];
