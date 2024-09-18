export type num = number;
export type int = number;
export type bool = boolean;
export type n_bool = 0 | 1;
export type isodate = string;
export type unixdate = number;
export type url = string;

export type AnyKV = {[k in any]: any};
export type KV<T extends AnyKV = AnyKV> = {[k in keyof T]: T[k]};

export const tryOrDefault = <T>(fn: () => T, def: T): T => {
    try {
        return fn();
    }
    catch (e) {
        return def;
    }
};
