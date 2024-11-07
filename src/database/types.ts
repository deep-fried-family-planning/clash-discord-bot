type Version = string;

export type Model<M = unknown> =
    & {
        version  : string;
        migrated?: boolean;
    }
    & M;

export type Store<V extends Version = Version, S = unknown> =
    & {
        version  : V;
        migrated?: boolean;
    }
    & S;

export type Codec<M extends Model, C extends readonly Store[]> = {
    [s in C[number] as s['version']]: {
        model: (store: s) => M;
        store: (model: M) => s;
    }
};

export type HashKey<T extends {pk: unknown}> = Pick<T, 'pk'>;

export type CompKey<T extends {pk: unknown; sk: unknown}> = Pick<T, 'pk' | 'sk'>;
