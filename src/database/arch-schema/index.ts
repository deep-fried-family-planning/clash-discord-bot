import * as Key from '#src/database/arch-schema/key-type.ts';
import * as Tag from '#src/database/constants/dtag.ts';
import * as Util from '#src/database/arch-schema/arch.ts';

export {
  Key as PkSk,
  Tag as DataTag,
  Util as Arch,
};

export type DataTag = Extract<typeof Tag[keyof typeof Tag], string>;
