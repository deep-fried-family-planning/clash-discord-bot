import type * as Hydrant from '#disreact/model/internal/Hydrant.ts';
import {declareSubtype} from '#disreact/util/proto.ts';
import * as Node from '@effect/platform-node/NodeStream';
import * as MsgPack from '@effect/platform/MsgPack';

export interface DiscordHash extends Hydrant.Hydrator {
  doken;
}

const DiscordHashPrototype = declareSubtype<DiscordHash, Hydrant.Hydrator>(Hydrant.HydratorPrototype, {

});
