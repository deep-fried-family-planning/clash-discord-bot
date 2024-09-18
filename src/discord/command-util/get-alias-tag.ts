import {DFFP_CLANS_ALIAS} from '#src/lambdas/temp-constants.ts';
import type {CID} from '#src/data/types.ts';
import {api_coc} from '#src/lambdas/client-api-coc.ts';
import {badRequest} from '@hapi/boom';

export const getAliasTag = (cid?: CID): CID => {
    if (!cid) {
        return '#2GR2G0PGG';
    }

    const alias = cid.replaceAll(' ', '').toLowerCase();

    const tag = alias in DFFP_CLANS_ALIAS
        ? DFFP_CLANS_ALIAS[alias as keyof typeof DFFP_CLANS_ALIAS]
        : alias;

    const formattedTag = api_coc.util.formatTag(tag);

    if (!api_coc.util.isValidTag(formattedTag)) {
        throw badRequest('user entered an invalid tag');
    }

    return formattedTag;
};
