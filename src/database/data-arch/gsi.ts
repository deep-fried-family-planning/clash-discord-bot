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
