import type {str} from '#src/internal/pure/types-pure.ts';


export const isIn = (key: str, obj?: object) => !!obj && (key in obj);
