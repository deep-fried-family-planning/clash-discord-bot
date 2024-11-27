import {DFFP_CLANS_ALIAS} from '#src/constants/dffp-alias.ts';
import type {CID} from '#src/internal/graph/types.ts';


export const getAliasTag = (cid?: CID): CID => {
    if (!cid) {
        return '#2GR2G0PGG';
    }

    const alias = cid.replaceAll(' ', '').toLowerCase();

    return alias in DFFP_CLANS_ALIAS
        ? DFFP_CLANS_ALIAS[alias as keyof typeof DFFP_CLANS_ALIAS]
        : alias;
};
