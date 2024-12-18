import {makeParams} from '#src/internal/ix-system/id/params.ts';
import {type CxKey, CxRoutes} from '#src/internal/ix-system/id/routes-keys.ts';


export const CxId = makeParams<typeof CxKey>(CxRoutes);


