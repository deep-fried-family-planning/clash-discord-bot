import type {BMulti, COL, Col, KIND, Mod, Row} from '#src/ix/enum/enums.ts';
import type {Id} from '#src/ix/types.ts';

export type Structural =
    {
        row: Row;
    } & (
        | Modal
        | GridRow
    );

export type Typeable =
    {
        col: COL['COL_1'];
        row: Row;
    } & (
        | ShortText
        | LongText
    );

export type Selectable =
    {
        col: COL['COL_1'];
        row: Row;
    } & (
        | StringSelect
        | NavSelect
        | UserSelect
        | RoleSelect
        | ChannelSelect
        | MentionableSelect
    );

export type Pressable =
    {
        row: Row;
        col: Col;
    } & (
        | Button
        | MultiButton
    );


export type Button = {
    id  : Id;
    kind: KIND['K_BUTTON'];
    mod : Mod;
    row : Row;
    col : Col;
};

export type MultiButton = {
    id   : Id;
    kind : KIND['K_BMULTI'];
    mod  : Mod;
    multi: BMulti;
};


export type StringSelect = {
    id  : Id;
    kind: KIND['K_SELSTR'];
    mod : Mod;
};

export type NavSelect = {
    id  : Id;
    kind: KIND['K_SELNAV'];
    mod : Mod;
};

export type UserSelect = {
    id  : Id;
    kind: KIND['K_SELUSR'];
    mod : Mod;
};

export type ChannelSelect = {
    id  : Id;
    kind: KIND['K_SELCHL'];
    mod : Mod;
};

export type RoleSelect = {
    id  : Id;
    kind: KIND['K_SELRLE'];
    mod : Mod;
};

export type MentionableSelect = {
    id  : Id;
    kind: KIND['K_SELALL'];
    mod : Mod;
};


export type Modal = {
    id  : Id;
    kind: KIND['K_DIALOG'];
    mod : Mod;
};

export type GridRow = {
    id  : Id;
    kind: KIND['K_GRIDRW'];
};


export type ShortText = {
    id  : Id;
    kind: KIND['K_TXTSHR'];
    mod : Mod;
};

export type LongText = {
    id  : Id;
    kind: KIND['K_TXTLNG'];
    mod : Mod;
};


