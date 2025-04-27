import type {CID} from '#src/internal/graph/types.ts';
import type {bool, int} from '#src/internal/pure/types-pure.ts';

import type {APIApplicationCommandBasicOption, APIApplicationCommandInteractionDataBasicOption, APIApplicationCommandInteractionDataOption, APIApplicationCommandInteractionDataSubcommandGroupOption, APIApplicationCommandInteractionDataSubcommandOption, APIApplicationCommandSubcommandGroupOption, APIApplicationCommandSubcommandOption, ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody} from '@discordjs/core/http-only';

// Utils
export type OverrideOptions<T, O> = Omit<T, 'options'> & {options: O};
type KV<V> = Record<string, V>;

// Aliases
type GetOptionData<T extends ApplicationCommandOptionType> =
  T extends APIApplicationCommandInteractionDataBasicOption['type']
    ? Extract<APIApplicationCommandInteractionDataBasicOption, {type: T}>['value']
    : Extract<APIApplicationCommandInteractionDataOption, {type: T}>;

type DataSubGroup = APIApplicationCommandInteractionDataSubcommandGroupOption;
type DataSubCmd = APIApplicationCommandInteractionDataSubcommandOption;

//
// Spec types
//
type SpecOptionBasic = APIApplicationCommandBasicOption;
type SpecOptionSubGroup = APIApplicationCommandSubcommandGroupOption;
type SpecOptionSubCmd = APIApplicationCommandSubcommandOption;

export type CommandSpec = OverrideOptions<RESTPostAPIChatInputApplicationCommandsJSONBody, Record<string,
  SpecOptionBasic
  | SubCommandSpec
  | SubGroupSpec
>>;
export type SubGroupSpec = OverrideOptions<SpecOptionSubGroup, Record<string, SubCommandSpec>>;
export type SubCommandSpec = OverrideOptions<SpecOptionSubCmd, Record<string, SpecOptionBasic>>;

export type OptionData<T extends CommandSpec['options']>
  = T extends KV<SpecOptionBasic> ? {
    [k in keyof T]: T[k] extends {required: true} ? GetOptionData<T[k]['type']> : (GetOptionData<T[k]['type']> | undefined);
  }
  : T extends KV<SpecOptionSubCmd> ? {
      [k in keyof T]: OverrideOptions<DataSubCmd, OptionData<T[k]['options']>>
    }
    : T extends KV<SpecOptionSubCmd> ? {
        [k in keyof T]: OverrideOptions<DataSubGroup, OptionData<T[k]['options']>>
      }
      : never;

export type IxDS<T extends CommandSpec> = OptionData<T['options']>;

export type SharedOptions = {
  cid1 : CID;
  cid2?: CID;

  limit: int;
  from : int;
  to   : int;

  showCurrent: bool;
  showN      : bool;
  exhaustive : bool;
};

export type snflk = `${bigint}`;
