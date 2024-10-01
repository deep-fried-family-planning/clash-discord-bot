import {sizeKV} from '#src/pure/pure-kv.ts';
import type {GraphModel} from '#src/data/pipeline/optimize-types.ts';

export const describeSamples = (model: GraphModel) => {
    return {
        hits_instances  : sizeKV(model.hits),
        wars_instances  : sizeKV(model.wars),
        clan_instances  : sizeKV(model.clans),
        player_instances: sizeKV(model.players),
    };
};
