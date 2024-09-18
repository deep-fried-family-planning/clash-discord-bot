import type {AnyKV, KV, unixdate} from '#src/data/types-pure.ts';
import {v4} from 'uuid';

export type UUID = string;
export type CID = string;
export type PID = string;
export type IGNAME = string;

export type IDKV<T > = Record<string, T>;

export type _Model = {
    _id: UUID;
    _tm: unixdate;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

export const attachModelId = <T extends AnyKV = AnyKV>(kv: T): T & _Model => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    (kv as Any)._id = kv._id ?? v4();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    (kv as Any)._tm = kv._tm ?? Date.now();
    return kv as T & _Model;
};
