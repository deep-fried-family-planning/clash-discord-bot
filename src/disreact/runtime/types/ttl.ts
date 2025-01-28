import {NONE_NUM} from '#src/disreact/api/constants.ts';



export type TTL = number;

export const empty            = () => NONE_NUM;
export const isEmpty          = (ttl: TTL | null) => !!ttl && ttl === NONE_NUM;
export const rightNow         = () => Date.now();
export const withoutDefer     = (now = rightNow()) => now + 2000;
export const withDefer        = (now = rightNow()) => now + 14 * 60 * 1000;
export const isActive         = (ttl: TTL | null, now = rightNow()) => isEmpty(ttl) && ttl > now;
export const isActiveBuffered = (ttl: TTL | null, now = rightNow()) => isEmpty(ttl) && ttl > now - 2 * 60 * 1000;
export const shouldRefresh    = (ttl: TTL | null, now = rightNow()) => isEmpty(ttl) && ttl < now - 2 * 60 * 1000;
