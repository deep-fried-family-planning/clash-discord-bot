export type num = number;
export type str = string;
export type und = undefined;
export type nl = null;
export type int = number;
export type bool = boolean;
export type n_bool = 0 | 1;
export type isodate = string;
export type unixdate = number;
export type url = string;
export type alias = Record<str, str>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyKV = {[k in any]: any};
export type KV<T extends AnyKV = AnyKV> = {[k in keyof T]: T[k]};

export const tryOrDefault = <T>(fn: () => T, def: T): T => {
    try {
        return fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (e) {
        return def;
    }
};
