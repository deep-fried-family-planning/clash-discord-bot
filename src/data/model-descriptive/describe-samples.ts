import {sizeKV} from '#src/data/pure-kv.ts';
import type {GraphModel} from '#src/data/pipeline/optimize-types.ts';

export const describeSamples = (model: GraphModel) => {
    return {
        hits             : sizeKV(model.hits),
        wars             : sizeKV(model.wars),
        clan_instances   : sizeKV(model.clans),
        players_instances: sizeKV(model.players),
    };
};
