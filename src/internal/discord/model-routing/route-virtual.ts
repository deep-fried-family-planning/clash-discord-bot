import type {str} from '#src/internal/pure/types-pure.ts';


export type RouteInput = {
    driver: str;
};

export type RouteOutput = {
    driver: str;
};

export const empty = () => ({});
