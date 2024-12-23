import {makeParams} from '#src/internal/ix-v2/id/params.ts';
import {type CxKey, CxRoutes} from '#src/internal/ix-v2/id/routes-keys.ts';


export const CxId = makeParams<typeof CxKey>(CxRoutes);


