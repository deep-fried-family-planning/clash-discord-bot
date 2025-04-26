import {PkSk} from '#src/database/arch-schema/index.ts';
import type {GsiKey, GsiName, GsiType} from '#src/database/constants/index.ts';
import {S} from '#src/internal/pure/effect.ts';

const asStruct = <
  N extends GsiName,
  T extends GsiType,
  K extends GsiKey,
>(
  name: N,
  type: T,
  field: K,
  value: S.Schema<string, string>,
) => {
  const Type = S.Struct({
    name : S.Literal(name),
    type : S.Literal(type),
    field: S.Literal(field),
    value: S.typeSchema(value),
  });

  return {
    Type,
    Transform: S.transform(value, Type, {
      decode: (enc) =>
        ({
          name,
          type,
          field,
          value: enc,
        }),
      encode: (dec) => dec.value,
    }),
  };
};

const partition = <
  N extends GsiName,
  T extends GsiType,
  K extends GsiKey,
>(
  name: N,
  type: T,
  key: K,
  hk: S.Schema<string, string>,
) => {
  const struct = asStruct(name, type, key, hk);

  return {
    name,
    type,
    HkType: struct.Type,
    Hk    : struct.Transform,
    RkType: S.Never,
    Rk    : S.Never,
  };
};

const composite = <
  N extends GsiName,
  T extends GsiType,
  HK extends GsiKey,
  RK extends GsiKey,
>(
  name: N,
  type: T,
  hk: HK,
  Hk: S.Schema<string, string>,
  rk: RK,
  Rk: S.Schema<string, string>,
) => {
  const Hash = asStruct(name, type, hk, Hk);
  const Range = asStruct(name, type, rk, Rk);

  return {
    name,
    type,
    HkType: Hash.Type,
    Hk    : Hash.Transform,
    RkType: Range.Type,
    Rk    : Range.Transform,
  };
};

export const AllServers = partition(
  'GSI_ALL_SERVERS',
  'ALL',
  'gsi_all_server_id',
  PkSk.ServerId,
);



// global_secondary_index {
//   name            = "GSI_ALL_SERVERS"
//   hash_key        = "gsi_all_server_id"
//   projection_type = "ALL"
//   read_capacity   = 1
//   write_capacity  = 1
// }
// global_secondary_index {
//   name            = "GSI_ALL_CLANS"
//   hash_key        = "gsi_clan_tag"
//   range_key       = "gsi_server_id"
//   projection_type = "ALL"
//   read_capacity   = 1
//   write_capacity  = 1
// }
// global_secondary_index {
//   name            = "GSI_ALL_PLAYERS"
//   hash_key        = "gsi_player_tag"
//   range_key       = "gsi_user_id"
//   projection_type = "ALL"
//   read_capacity   = 1
//   write_capacity  = 1
// }
// global_secondary_index {
//   name            = "GSI_USER_ROSTER_SIGNUPS"
//   hash_key        = "gsi_user_id"
//   range_key       = "gsi_roster_id"
//   projection_type = "ALL"
//   read_capacity   = 1
//   write_capacity  = 1
// }
