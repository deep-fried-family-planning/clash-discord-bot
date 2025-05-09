export * as DataTag from '#src/data/constants/data-tag.ts';
export type DataTag = typeof DataTag[keyof typeof DataTag];

export const enum ClanVerification {
  admin     = 0,
  elder     = 1,
  coleader  = 2,
  leader    = 3,
  developer = 4,
}

export const enum PlayerVerification {
  none      = 0,
  admin     = 1,
  token     = 2,
  developer = 3,
}
