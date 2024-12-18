import type {str} from '#src/internal/pure/types-pure.ts';
import {inspect} from 'node:util';


export const logThru = <T>(name: str, loggable: T): T => {
    console.log(`[${name}]`, inspect(loggable, true, null));

    return loggable;
};


