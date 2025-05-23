import type {GraphModel} from '#src/internal/graph/pipeline/optimize-types.ts';
import {sizeKV} from '#src/internal/pure/pure-kv.ts';

export const describeSamples = (model: GraphModel) => {
  return {
    hits_instances  : sizeKV(model.hits),
    wars_instances  : sizeKV(model.wars),
    clan_instances  : sizeKV(model.clans),
    player_instances: sizeKV(model.players),
  };
};
