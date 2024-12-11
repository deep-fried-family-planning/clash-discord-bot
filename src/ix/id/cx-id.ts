import {makeParams} from '#src/ix/id/params.ts';
import {type CxKey, CxRoutes} from '#src/ix/id/routes-keys.ts';


export const CxId = makeParams<typeof CxKey>(CxRoutes);


