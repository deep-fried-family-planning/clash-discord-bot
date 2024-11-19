import {E} from '#src/internal/pure/effect.ts';
import type {DRoster, DRosterKey} from '#src/dynamo/discord-roster.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export const rosterCreate = (roster: DRoster) => E.gen(function * () {

});


export const rosterRead = (roster: DRosterKey) => E.gen(function * () {

});


export const rosterQueryByServer = (roster: Pick<DRosterKey, 'pk'>) => E.gen(function * () {

});


export const rosterUpdate = () => E.gen(function * () {

});


export const rosterDelete = () => E.gen(function * () {

});
