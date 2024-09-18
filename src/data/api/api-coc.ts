import {sort} from 'fp-ts/Array';
import {fromCompare} from 'fp-ts/Ord';
import type {ClanWarMember} from 'clashofclans.js';
import {Ord} from 'fp-ts/number';

export const sortMapPosition = sort(fromCompare<ClanWarMember>((a, b) => Ord.compare(a.mapPosition, b.mapPosition)));
