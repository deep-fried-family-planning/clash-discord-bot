import type {Any} from '#src/data/types.ts';

export const getFrom = (body: Any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const from = Number(String(body.data.options.from ?? '1'));

    return from;
};

export const getTo = (body: Any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const to = Number(String(body.data.options.to ?? '50'));

    return to;
};

export const getLimit = (body: Any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Number(String(body.data.options.limit ?? '50'));
};

export const getNShow = (body: Any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Boolean(body.data.options.nshow);
};

export const getExhaustive = (body: Any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Boolean(body.data.options.exhaustive);
};

export const getPlayerInfo = (body: Any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Boolean(body.data.options.latest);
};
